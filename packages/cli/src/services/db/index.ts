import sqlitePkg from "sqlite3"
import { open } from "sqlite"
import {
  CREATE_BLOCK_TABLE,
  CREATE_GAME_VERSION_TABLE,
  CREATE_HARVEST_TOOL_QUALITY_TABLE,
  CREATE_HARVEST_TOOL_TABLE,
  CREATE_IMPORTED_GAME_VERSION_TABLE,
  CREATE_NAMESPACE_TABLE,
} from "./mutations/createTables"
import { Int, MutationResult } from "../../types/shared"
import { LIMIT } from "./constants"
import mkdirp from "mkdirp"
const sqlite3 = sqlitePkg.verbose()

// TODO: https://www.sqlitetutorial.net/sqlite-foreign-key/
/**
 * Closure to connect to the underlying SQLite database - returned methods use the database
 * connection
 *
 * @returns an object containing all necessary database operations for the minecraft asset reader app to function
 */
export async function Dao(gameVersion?: string) {
  /**
   * All game version database files are stored in /tmp/minecraft-asset-reader (on UNIX - still needs Windows support)
   */
  await mkdirp(`/tmp/minecraft-asset-reader/`)
  let fp
  if (gameVersion) {
    fp = `/tmp/minecraft-asset-reader/${gameVersion}.db`
  } else {
    fp = `/tmp/minecraft-asset-reader/main.db`
  }
  const db = await open({
    filename: fp,
    driver: sqlite3.Database,
  })
  return {
    /**
     * Set up the main database
     */
    initMainDb: async (): Promise<MutationResult> => {
      try {
        await db.run(CREATE_IMPORTED_GAME_VERSION_TABLE)
        await db.close()
        return {
          success: true,
        }
      } catch (e) {
        await db.close()
        return {
          success: false,
          message: `Error: ${e.message}`,
        }
      }
    },
    /**
     * Gets the list of game versions that have actually been imported (so we know when an unknown game version
     * has been specified for a game-version specific API)
     */
    getImportedGameVersions: async () => {
      const versions = [] as string[]
      await db.each(`SELECT version FROM imported_game_version`, (err, row) => {
        if (err) console.log(`ERROR: `, err.message)
        versions.push(row.version)
      })
      await db.close()
      return versions
    },
    addImportedGameVersion: async (
      gameVersion: string
    ): Promise<MutationResult> => {
      try {
        await db.run(
          `INSERT OR IGNORE INTO imported_game_version (version) VALUES (?)`,
          gameVersion
        )
        await db.close()
        return {
          success: true,
        }
      } catch (e) {
        await db.close()
        return {
          success: false,
          message: `Error: ${e.message}`,
        }
      }
    },
    /**
     * Set up the tables in the database for a game version
     */
    initGameVersionDatabase: async (): Promise<MutationResult> => {
      try {
        await Promise.all([
          db.run(CREATE_HARVEST_TOOL_TABLE),
          db.run(CREATE_HARVEST_TOOL_QUALITY_TABLE),
          db.run(CREATE_BLOCK_TABLE),
          db.run(CREATE_NAMESPACE_TABLE),
          db.run(CREATE_GAME_VERSION_TABLE),
        ])
        // Populate the harvest_tool table
        var popHarvestToolsResult = await db.run(
          `INSERT OR IGNORE INTO harvest_tool (key) VALUES (?),(?),(?),(?),(?),(?)`,
          [`axe`, `hoe`, `pickaxe`, `shovel`, `hand`, `none`]
        )

        // Populate the harvest_tool_quality table
        var popHarvestToolQualitiesResult = await db.run(
          `INSERT OR IGNORE INTO harvest_tool_quality (key) VALUES (?),(?),(?),(?),(?),(?),(?)`,
          [`wood`, `stone`, `iron`, `gold`, `diamond`, `netherite`, `none`]
        )

        await db.close()
        // If both of these were defined, we know a successful insert operation took place
        if (
          !!popHarvestToolsResult.lastID &&
          !!popHarvestToolQualitiesResult.lastID
        ) {
        }

        return {
          success: true,
          message: `Created game-version database for currently-imported raw game data (no data exists yet)`,
        }
      } catch (e) {
        await db.close()
        return {
          success: false,
          message: `Error: ${e.message}`,
        }
      }
    },
    /**
     * Get the list of harvest tools that can be used to break blocks (e.g., shovels, axes, etc.)
     *
     * @returns Array of all harvest tools
     */
    getHarvestTools: async () => {
      const harvestTools = [] as any[]
      await db.each(`SELECT rowid AS id, key FROM harvest_tool`, (err, row) => {
        if (err) console.log(`ERROR: `, err.message)
        harvestTools.push(row)
      })
      await db.close()
      return harvestTools
    },
    addNamespace: async (namespace: string): Promise<Int> => {
      try {
        const data = await db.run(
          `INSERT OR IGNORE INTO namespace (key) VALUES (?)`,
          namespace
        )
        await db.close()
        return data.lastID as Int
      } catch (e) {
        console.log(`Error inserting namespace: `, e.message)
        await db.close()
        return 0 as Int
      }
    },
    getNamespaces: async (search?: string) => {
      const namespaces = [] as { id: Int; key: string }[]
      if (!!search) {
        try {
          const result = await db.each(
            `SELECT * FROM namespace WHERE key LIKE ?`,
            `${search}%`,
            (err, row) => {
              if (err) console.log(`ERROR: `, err)
              namespaces.push(row)
            }
          )
          console.log(`RESULT: `, result)
        } catch (e) {
          console.log(`Error getting namespaces: `, e.message)
        }
      } else {
        await db.each(`SELECT * FROM namespace`, (err, row) => {
          if (err) console.log(`ERROR: `, err.message)
          namespaces.push(row)
        })
      }

      await db.close()
      return {
        items: namespaces,
      }
    },
    /**
     * Get the list of harvest tool qualities for tools used to break blocks, indicating the "tier"
     * of tool. For example, a stone pickaxe is a higher-quality tool than a wood one. The relationship
     * between these qualities is the same as it in the base Minecraft game:
     *
     * > Netherite > Diamond > Gold* > Iron > Stone > Wood
     *
     * * Netherite tools have the highest durability and fastest harvest speed
     * * Diamond tools have less durability than Netherite, and slower harvest speed than gold
     * * *Gold tools harvest faster than diamond, but have less base durability than everything else, including wood
     * * The remaining harvest tool qualities are fairly linear with iron better than stone in both durability and speed, and stone better than wood in the same way
     *
     * @returns Array of all harvest tools
     */
    getHarvestToolQualities: async () => {
      const harvestToolQualities = [] as any[]
      await db.each(
        `SELECT rowid AS id, key FROM harvest_tool_quality`,
        (err, row) => {
          if (err) console.log(`ERROR: `, err.message)
          harvestToolQualities.push(row)
        }
      )
      await db.close()
      return harvestToolQualities
    },
    /**
     * Add a new block, if it doesn't exist, or update the existing one if it does
     *
     * Block uniqueness is determined by the key for the block; e.g., there cannot be two blocks in the table
     * with the same key value
     *
     * @param key
     * @param title
     * @param icon
     * @param description
     * @param flammabilityEncouragementValue
     * @param flammability
     * @param lightLevel
     * @param minSpawn
     * @param maxSpawn
     */
    addOrUpdateBlock: async (args: {
      key: string
      namespace: string
      title?: string
      icon?: string
      description?: string
      flammabilityEncouragementValue?: Int
      flammability?: Int
      lightLevel?: Int
      minSpawn?: Int
      maxSpawn?: Int
    }): Promise<MutationResult> => {
      const {
        key,
        namespace,
        title,
        icon,
        description,
        flammabilityEncouragementValue,
        flammability,
        lightLevel,
        minSpawn,
        maxSpawn,
      } = args

      if (
        !!flammabilityEncouragementValue &&
        (flammabilityEncouragementValue <
          LIMIT.FLAMMABILITY_ENCOURAGEMENT.MIN ||
          flammabilityEncouragementValue > LIMIT.FLAMMABILITY_ENCOURAGEMENT.MAX)
      ) {
        return {
          success: false,
          message: `Flammability encouragement must be between ${LIMIT.FLAMMABILITY_ENCOURAGEMENT.MIN} and ${LIMIT.FLAMMABILITY_ENCOURAGEMENT.MAX}`,
        }
      }

      if (
        !!flammability &&
        (flammability < LIMIT.FLAMMABILITY.MIN ||
          flammability > LIMIT.FLAMMABILITY.MAX)
      ) {
        return {
          success: false,
          message: `Flammability must be between ${LIMIT.FLAMMABILITY.MIN} and ${LIMIT.FLAMMABILITY.MAX}`,
        }
      }

      if (
        !!lightLevel &&
        (lightLevel < LIMIT.LIGHT_LEVEL.MIN ||
          lightLevel > LIMIT.LIGHT_LEVEL.MAX)
      ) {
        return {
          success: false,
          message: `Light level must be between ${LIMIT.LIGHT_LEVEL.MIN} and ${LIMIT.LIGHT_LEVEL.MAX}`,
        }
      }

      // TODO: enforce rule to make sure these values are always set together
      if (
        !!minSpawn &&
        !!maxSpawn &&
        (minSpawn < LIMIT.SPAWN.MIN ||
          minSpawn > LIMIT.SPAWN.MAX ||
          maxSpawn < LIMIT.SPAWN.MIN ||
          maxSpawn > LIMIT.SPAWN.MAX ||
          minSpawn > maxSpawn)
      ) {
        await db.close()
        return {
          success: false,
          message: `Min and max spawn must be between ${LIMIT.SPAWN.MIN} and ${LIMIT.SPAWN.MAX}, and min spawn cannot be greater than max spawn`,
        }
      }

      let namespaceId = -1
      const getNamespaceResult = await (await Dao(gameVersion)).getNamespaces(
        namespace
      )
      if (getNamespaceResult.items.length === 0) {
        namespaceId = await (await Dao(gameVersion)).addNamespace(namespace)
      } else {
        namespaceId = getNamespaceResult.items[0].id
      }

      try {
        var insertBlockResult = await db.run(
          `INSERT OR REPLACE INTO block (
            key,
            namespace_id,
            title, 
            icon, 
            description, 
            flammability_encouragement, 
            flammability, 
            light_level, 
            min_spawn, 
            max_spawn
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            key,
            namespaceId,
            title,
            icon,
            description,
            flammabilityEncouragementValue,
            flammability,
            lightLevel,
            minSpawn,
            maxSpawn,
          ]
        )

        await db.close()
        return {
          success: true,
          message: `Created block record for '${key}' with ID: ${insertBlockResult.lastID}`,
        }
      } catch (e) {
        await db.close()
        return {
          success: false,
          message: e.message,
        }
      }
    },
    getBlocks: async (args: { search?: string }) => {
      const { search } = args
      const blocks = [] as any[]
      if (!!search) {
        await db.each(
          `SELECT * FROM block WHERE key LIKE ?`,
          `${search}%`,
          (err, row) => {
            if (err) console.log(`ERROR: `, err.message)
            blocks.push(row)
          }
        )
      } else {
        await db.each(`SELECT * FROM block`, (err, row) => {
          if (err) console.log(`ERROR: `, err.message)
          blocks.push(row)
        })
      }
      await db.close()
      return blocks
    },
    deleteBlock: async (args: { key: string }): Promise<MutationResult> => {
      try {
        const deleteResult = await db.run(
          `DELETE FROM block WHERE key = ?`,
          args.key
        )
        await db.close()
        if (!!deleteResult.changes && deleteResult.changes >= 1) {
          return {
            success: true,
            message: `Deleted block '${args.key}' successfully`,
          }
        } else {
          return {
            success: false,
            message: `No blocks with key '${args.key}' - no action taken`,
          }
        }
      } catch (e) {
        await db.close()
        return {
          success: false,
          message: `Error: ${e.message}`,
        }
      }
    },
  }
}
