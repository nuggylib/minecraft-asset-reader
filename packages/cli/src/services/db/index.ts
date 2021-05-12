import sqlitePkg from "sqlite3"
import { open } from "sqlite"
import {
  CREATE_BLOCK_TABLE,
  CREATE_GAME_VERSION_TABLE,
  CREATE_HARVEST_TOOL_QUALITY_TABLE,
  CREATE_HARVEST_TOOL_TABLE,
  CREATE_NAMESPACE_TABLE,
} from "./mutations/createTables"
import { Int, MutationResult } from "../../types/shared"
import { LIMIT } from "./constants"
const sqlite3 = sqlitePkg.verbose()

/**
 * Closure to connect to the underlying SQLite database - returned methods use the database
 * connection
 *
 * @returns an object containing all necessary database operations for the minecraft asset reader app to function
 */
export function Dao() {
  const fp = `/tmp/data.db`
  return open({
    filename: fp,
    driver: sqlite3.Database,
  })
    .then((obj) => {
      const db = obj.db
      return {
        /**
         * Set up the tables in the database
         */
        initDb: () => {
          db.serialize(() => {
            db.run(CREATE_HARVEST_TOOL_TABLE)
            db.run(CREATE_HARVEST_TOOL_QUALITY_TABLE)
            db.run(CREATE_BLOCK_TABLE)
            db.run(CREATE_NAMESPACE_TABLE)
            db.run(CREATE_GAME_VERSION_TABLE)
          })
        },
        populate: () => {
          // TODO: Add a check to see if the "constants" tables have already been populated
          db.serialize(() => {
            // Populate the harvest_tool table
            var statement = db.prepare(
              `INSERT INTO harvest_tool (key) VALUES (?)`
            )
            ;[`axe`, `hoe`, `pickaxe`, `shovel`, `hand`, `none`].forEach(
              (tool) => {
                statement.run(tool)
              }
            )
            statement.finalize()

            // Populate the harvest_tool_quality table
            var statement = db.prepare(
              `INSERT INTO harvest_tool_quality (key) VALUES (?)`
            )
            ;[
              `wood`,
              `stone`,
              `iron`,
              `gold`,
              `diamond`,
              `netherite`,
              `none`,
            ].forEach((tool) => {
              statement.run(tool)
            })
            statement.finalize()
          })
        },
        /**
         * Get the list of harvest tools that can be used to break blocks (e.g., shovels, axes, etc.)
         *
         * @returns Array of all harvest tools
         */
        getHarvestTools: () => {
          const tools = [] as string[]
          db.serialize(() => {
            db.each(`SELECT rowid AS id, key FROM harvest_tool`, (err, row) => {
              if (err) console.log(`ERROR: `, err)
              else tools.push(row.key)
            })
          })
          return tools
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
        getHarvestToolQualities: () => {
          const harvestToolQualities = [] as string[]
          db.serialize(() => {
            db.each(
              `SELECT rowid AS id, key FROM harvest_tool_quality`,
              (err, row) => {
                if (err) console.log(`ERROR: `, err)
                else harvestToolQualities.push(row.key)
              }
            )
          })
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
        addOrUpdateBlock: (args: {
          key: string
          title: string
          icon: string
          description: string
          flammabilityEncouragementValue: Int
          flammability: Int
          lightLevel: Int
          minSpawn: Int
          maxSpawn: Int
        }): MutationResult => {
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
            flammabilityEncouragementValue <
              LIMIT.FLAMMABILITY_ENCOURAGEMENT.MIN ||
            flammabilityEncouragementValue >
              LIMIT.FLAMMABILITY_ENCOURAGEMENT.MAX
          ) {
            return {
              success: false,
              message: `Flammability encouragement must be between ${LIMIT.FLAMMABILITY_ENCOURAGEMENT.MIN} and ${LIMIT.FLAMMABILITY_ENCOURAGEMENT.MAX}`,
            }
          }

          if (
            flammability < LIMIT.FLAMMABILITY.MIN ||
            flammability > LIMIT.FLAMMABILITY.MAX
          ) {
            return {
              success: false,
              message: `Flammability must be between ${LIMIT.FLAMMABILITY.MIN} and ${LIMIT.FLAMMABILITY.MAX}`,
            }
          }

          if (
            lightLevel < LIMIT.LIGHT_LEVEL.MIN ||
            lightLevel > LIMIT.LIGHT_LEVEL.MAX
          ) {
            return {
              success: false,
              message: `Light level must be between ${LIMIT.LIGHT_LEVEL.MIN} and ${LIMIT.LIGHT_LEVEL.MAX}`,
            }
          }

          if (
            minSpawn < LIMIT.SPAWN.MIN ||
            minSpawn > LIMIT.SPAWN.MAX ||
            maxSpawn < LIMIT.SPAWN.MIN ||
            maxSpawn > LIMIT.SPAWN.MAX ||
            minSpawn > maxSpawn
          ) {
            return {
              success: false,
              message: `Min and max spawn must be between ${LIMIT.SPAWN.MIN} and ${LIMIT.SPAWN.MAX}, and min spawn cannot be greater than max spawn`,
            }
          }

          // TODO: Actually perform the update now that validation has taken place

          return {
            success: true,
          }
        },
        /**
         * Close the connection to the database
         */
        close: () => {
          db.close()
        },
      }
    })
    .catch((e) => {
      console.log(`Error opening the database file: `, e)
    })
}
