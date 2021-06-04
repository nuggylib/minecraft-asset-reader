import sqlitePkg from "sqlite3"
import { open } from "sqlite"
import {
  CREATE_BLOCK_TABLE,
  CREATE_BLOCK_TO_BLOCK_TABLE,
  CREATE_GAME_VERSION_TABLE,
  CREATE_HARVEST_TOOL_QUALITY_TABLE,
  CREATE_HARVEST_TOOL_QUALITY_TO_BLOCK_TABLE,
  CREATE_HARVEST_TOOL_TABLE,
  CREATE_HARVEST_TOOL_TO_BLOCK_TABLE,
  CREATE_IMPORTED_GAME_VERSION_TABLE,
  CREATE_NAMESPACE_TABLE,
} from "./mutations/createTables"
import { Int, MutationResult, QueryResult } from "../types/shared"
import { LIMIT } from "./constants"
import mkdirp from "mkdirp"
const sqlite3 = sqlitePkg.verbose()

/**
 * Closure to connect to the underlying SQLite database - returned methods use the database
 * connection
 *
 * When gameVersion is not provided, the game-version specific operations will not work (this will be improved
 * in the future by safely preventing calls to APIs that shouldn't be enabled)
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
          db.run(CREATE_HARVEST_TOOL_QUALITY_TO_BLOCK_TABLE),
          db.run(CREATE_HARVEST_TOOL_TO_BLOCK_TABLE),
          db.run(CREATE_BLOCK_TO_BLOCK_TABLE),
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
    addNamespace: async (namespace: string): Promise<MutationResult> => {
      try {
        const data = await db.run(
          `INSERT OR IGNORE INTO namespace (key) VALUES (?)`,
          namespace
        )
        await db.close()
        return {
          success: true,
          id: data.lastID as Int,
        }
      } catch (e) {
        await db.close()
        return {
          success: false,
          message: e.message,
        }
      }
    },
    /**
     * Get currently-saved namespaces for the passed-in game version
     *
     * Note that the only namespaces that are saved are ones that the user has configured
     * data for via the webapp (or API, if they are doing something fancy on their own)
     *
     * @param search
     * @returns Array of `QueryResult` objects where `data` is the string for the namespace name
     */
    getNamespaces: async (search?: string): Promise<QueryResult[]> => {
      const namespaces = [] as QueryResult[]
      if (!!search) {
        try {
          await db.each(
            `SELECT * FROM namespace WHERE key LIKE ?`,
            `${search}%`,
            (err, row) => {
              if (err) console.log(`ERROR: `, err)
              namespaces.push({
                id: row.id,
                data: row.key,
              })
            }
          )
        } catch (e) {
          console.log(`Error getting namespaces: `, e.message)
        }
      } else {
        await db.each(`SELECT * FROM namespace`, (err, row) => {
          if (err) console.log(`ERROR: `, err.message)
          namespaces.push({
            id: row.id,
            data: row.key,
          })
        })
      }

      await db.close()
      return namespaces
    },
    getNamespaceById: async (namespaceId: Int): Promise<QueryResult> => {
      let result = (null as unknown) as QueryResult
      try {
        await db.each(
          `SELECT * FROM namespace WHERE id = ?`,
          [namespaceId],
          (err, row) => {
            if (err) console.log(`ERROR: `, err.message)
            result = {
              id: row.id,
              data: row,
            }
          }
        )
      } catch (e) {
        console.log(
          `Unable to get namespace by ID '${namespaceId}': `,
          e.message
        )
      }
      return result
    },
    /**
     * Get the list of harvest tools that can be used to break blocks (e.g., shovels, axes, etc.)
     *
     * @returns Array of all harvest tools
     */
    getHarvestTools: async (search?: string): Promise<QueryResult[]> => {
      const harvestTools = [] as QueryResult[]
      if (!!search) {
        await db.each(
          `SELECT * FROM harvest_tool WHERE key LIKE ?`,
          `${search}%`,
          (err, row) => {
            if (err) console.log(`ERROR: `, err)
            harvestTools.push({
              id: row.id,
              data: row,
            })
          }
        )
      } else {
        await db.each(`SELECT * FROM harvest_tool`, (err, row) => {
          if (err) console.log(`ERROR: `, err.message)
          harvestTools.push({
            id: row.id,
            data: row,
          })
        })
      }
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
    getHarvestToolQualities: async (
      search?: string
    ): Promise<QueryResult[]> => {
      const harvestToolQualities = [] as QueryResult[]
      if (!!search) {
        await db.each(
          `SELECT * FROM harvest_tool_quality WHERE key LIKE ?`,
          `${search}%`,
          (err, row) => {
            if (err) console.log(`ERROR: `, err)
            harvestToolQualities.push({
              id: row.id,
              data: row,
            })
          }
        )
      } else {
        await db.each(`SELECT * FROM harvest_tool_quality`, (err, row) => {
          if (err) console.log(`ERROR: `, err.message)
          harvestToolQualities.push({
            id: row.id,
            data: row,
          })
        })
      }
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
      iconSideTop?: string
      iconSideLeft?: string
      iconSideRight?: string
      flammabilityEncouragementValue?: Int
      flammability?: Int
      lightLevel?: Int
      minSpawn?: Int
      maxSpawn?: Int
      harvestTool?: string
      harvestToolQualities?: string[]
    }): Promise<MutationResult> => {
      const {
        key,
        namespace,
        title,
        icon,
        flammabilityEncouragementValue,
        flammability,
        lightLevel,
        minSpawn,
        maxSpawn,
        iconSideTop,
        iconSideLeft,
        iconSideRight,
        harvestTool,
        harvestToolQualities,
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
      if (getNamespaceResult.length === 0) {
        namespaceId = await (
          await (await Dao(gameVersion)).addNamespace(namespace)
        ).id!
      } else {
        namespaceId = getNamespaceResult[0].id
      }

      try {
        await db.run(
          `INSERT INTO block (
            key,
            namespace_id,
            title, 
            icon, 
            flammability_encouragement, 
            flammability, 
            light_level, 
            min_spawn, 
            max_spawn,
            icon_side_top,
            icon_side_left,
            icon_side_right
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
              ON CONFLICT(key) DO UPDATE SET
                key=excluded.key,
                namespace_id=excluded.namespace_id,
                title=excluded.title, 
                icon=excluded.icon, 
                flammability_encouragement=excluded.flammability_encouragement, 
                flammability=excluded.flammability, 
                light_level=excluded.light_level, 
                min_spawn=excluded.min_spawn, 
                max_spawn=excluded.max_spawn,
                icon_side_top=excluded.icon_side_top,
                icon_side_left=excluded.icon_side_left,
                icon_side_right=excluded.icon_side_right;`,
          [
            key,
            namespaceId,
            title,
            icon,
            flammabilityEncouragementValue,
            flammability,
            lightLevel,
            minSpawn,
            maxSpawn,
            iconSideTop,
            iconSideLeft,
            iconSideRight,
          ]
        )

        const blocks = await (await Dao(gameVersion)).getBlocks({
          search: key,
        })

        if (!!harvestTool) {
          const matchingHarvestTools = await (
            await Dao(gameVersion)
          ).getHarvestTools(harvestTool)

          await (await Dao(gameVersion)).resetHarvestToolsForBlock(
            blocks[0].id as Int
          )
          /**
           * Since this method may be called a number of times, we only want to insert the corresponding value for this
           * once.
           */
          await db.run(
            `INSERT INTO harvest_tool_to_block (
            block_id,
            harvest_tool_id
          ) VALUES (?, ?) ON CONFLICT DO NOTHING;`,
            [blocks[0].id, matchingHarvestTools[0].id]
          )
        }

        if (!!harvestToolQualities) {
          await (await Dao(gameVersion)).resetHarvestToolQualitiesForBlock(
            blocks[0].id as Int
          )
          await Promise.all(
            harvestToolQualities!.map(async (quality) => {
              const matchingHarvestToolQuality = await (
                await Dao(gameVersion)
              ).getHarvestToolQualities(quality)

              await db.run(
                `INSERT INTO harvest_tool_quality_to_block (
                block_id,
                harvest_tool_quality_id
              ) VALUES (?, ?) ON CONFLICT DO NOTHING;`,
                [blocks[0].id, matchingHarvestToolQuality[0].id]
              )
            })
          )
        }

        await db.close()
        return {
          success: true,
          message: `Created/updated block record for '${key}' with ID: ${blocks[0].id}`,
        }
      } catch (e) {
        console.log(`Unable to insert record: `, e.message)
        await db.close()
        return {
          success: false,
          message: e.message,
        }
      }
    },
    /**
     * Get blocks
     *
     * If `search` is defined, but `namespaceId` is not, this will return query all blocks in all namespaces that match
     * the given `search` parameter (either partial or exact)
     *
     * If `search` is defined and `namespaceId` are both defined, this will return all blocks in the target namespace
     * that match the given `search` parameter (either partial or exact)
     *
     * If `search` and `namespaceId` are both undefined, all blocks from all namespaces (within the cached game version)
     * will be returned.
     *
     * SPECIAL NOTE:
     * When the result set only includes one result, the `harvest_tools` and `harvest_tool_qualities` fields are added to the
     * returned `data` object (within the `QueryResult`)
     *
     * @param args
     * @returns
     */
    getBlocks: async (args: {
      search?: string
      namespaceId?: Int
    }): Promise<QueryResult[]> => {
      const { search, namespaceId } = args
      const blocks = [] as QueryResult[]
      // Get all blocks by key AND namespace ID
      if (!!search && !!namespaceId) {
        await db.each(
          `SELECT * FROM block WHERE key LIKE ? AND namespace_id=?`,
          [`${search}%`, namespaceId],
          (err, row) => {
            if (err) console.log(`ERROR: `, err.message)
            blocks.push({
              id: row.id,
              data: row,
            })
          }
        )
        // Get all blocks just by key (capable of getting matching blocks from multiple namespaces in the same game version)
      } else if (!!search && !namespaceId) {
        await db.each(
          `SELECT * FROM block WHERE key LIKE ?`,
          `${search}%`,
          (err, row) => {
            if (err) console.log(`ERROR: `, err.message)
            blocks.push({
              id: row.id,
              data: row,
            })
          }
        )
      } else if (!search && !!namespaceId) {
        await db.each(
          `SELECT * FROM block WHERE namespace_id=?`,
          namespaceId,
          (err, row) => {
            if (err) console.log(`ERROR: `, err.message)
            blocks.push({
              id: row.id,
              data: row,
            })
          }
        )
      }
      // Just gets all blocks for the current game version
      else {
        await db.each(`SELECT * FROM block`, (err, row) => {
          if (err) console.log(`ERROR: `, err.message)
          blocks.push({
            id: row.id,
            data: row,
          })
        })
      }

      // If there is only one block in the search result, return some more information (mostly used for BlockModal)
      if (blocks.length === 1) {
        const blockId = blocks[0].id
        const harvestToolsForBlock = await (
          await Dao(gameVersion)
        ).getHarvestToolsForBlock(blockId)
        const harvestToolQualitiesForBlock = await (
          await Dao(gameVersion)
        ).getHarvestToolQualitiesForBlock(blockId)

        const swap = {
          id: blockId,
          data: {
            ...blocks[0].data,
            harvest_tools: harvestToolsForBlock,
            harvest_tool_qualities: harvestToolQualitiesForBlock,
          },
        }

        blocks[0] = swap
      }

      await db.close()
      return blocks
    },
    getHarvestToolsForBlock: async (blockId: Int): Promise<QueryResult[]> => {
      const harvestTools = [] as QueryResult[]
      try {
        await db.each(
          `SELECT * FROM harvest_tool_to_block
            LEFT JOIN harvest_tool ON harvest_tool_to_block.harvest_tool_id = harvest_tool.id
            WHERE block_id = ?`,
          [blockId],
          (err, row) => {
            if (err) console.log(`ERROR: `, err.message)
            harvestTools.push({
              id: row.id,
              data: row.key,
            })
          }
        )
      } catch (e) {
        console.log(`Unable to get harvest tools for block: `, e.message)
      }

      return harvestTools
    },
    getHarvestToolQualitiesForBlock: async (
      blockId: Int
    ): Promise<QueryResult[]> => {
      const harvestTools = [] as QueryResult[]
      try {
        await db.each(
          `SELECT * FROM harvest_tool_quality_to_block
            LEFT JOIN harvest_tool_quality ON harvest_tool_quality_to_block.harvest_tool_quality_id = harvest_tool_quality.id
            WHERE block_id = ?`,
          [blockId],
          (err, row) => {
            if (err) console.log(`ERROR: `, err.message)
            harvestTools.push({
              id: row.id,
              data: row.key,
            })
          }
        )
      } catch (e) {
        console.log(`Unable to get harvest tools for block: `, e.message)
      }

      return harvestTools
    },
    resetHarvestToolsForBlock: async (blockId: Int) => {
      try {
        await db.run(
          `DELETE FROM harvest_tool_to_block WHERE block_id = ?`,
          blockId
        )
        await db.close()
      } catch (e) {
        console.log(
          `Error resetting harvest tools for block ID '${blockId}': `,
          e.message
        )
      }
    },
    resetHarvestToolQualitiesForBlock: async (blockId: Int) => {
      try {
        await db.run(
          `DELETE FROM harvest_tool_quality_to_block WHERE block_id = ?`,
          blockId
        )
        await db.close()
      } catch (e) {
        console.log(
          `Error resetting harvest tool qualities for block ID '${blockId}': `,
          e.message
        )
      }
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
