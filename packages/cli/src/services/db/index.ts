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
    initMainDb: async () => {
      await db.run(CREATE_IMPORTED_GAME_VERSION_TABLE)
      await db.close()
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
    addImportedGameVersion: async (gameVersion: string) => {
      await db.run(
        `INSERT OR IGNORE INTO imported_game_version (version) VALUES (?)`,
        gameVersion
      )
      await db.close()
    },
    /**
     * Set up the tables in the database for a game version
     */
    initGameVersionDatabase: async () => {
      await Promise.all([
        db.run(CREATE_HARVEST_TOOL_TABLE),
        db.run(CREATE_HARVEST_TOOL_QUALITY_TABLE),
        db.run(CREATE_BLOCK_TABLE),
        db.run(CREATE_NAMESPACE_TABLE),
        db.run(CREATE_GAME_VERSION_TABLE),
      ])
      // TODO: stop simply replacing the values; make this logic conditional based on if data already exists (replacing updates the IDs)
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
        return {
          success: false,
          message: `Min and max spawn must be between ${LIMIT.SPAWN.MIN} and ${LIMIT.SPAWN.MAX}, and min spawn cannot be greater than max spawn`,
        }
      }

      try {
        var insertBlockResult = await db.run(
          `INSERT OR REPLACE INTO block (
            key, 
            title, 
            icon, 
            description, 
            flammability_encouragement, 
            flammability, 
            light_level, 
            min_spawn, 
            max_spawn
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            key,
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
    deleteBlock: async (args: { key: string }) => {
      const response = await db.run(`DELETE FROM block WHERE key = ?`, args.key)
      await db.close()
      return response
    },
  }
}
