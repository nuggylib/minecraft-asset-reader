export const CREATE_NAMESPACE_TABLE = `CREATE TABLE IF NOT EXISTS namespace (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    key         TEXT    NOT NULL UNIQUE
)`

export const CREATE_GAME_VERSION_TABLE = `CREATE TABLE IF NOT EXISTS game_version (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    key         TEXT    NOT NULL,
    namespace_id    INTEGER,
    FOREIGN KEY (namespace_id) REFERENCES namespace (namespace_id) ON DELETE CASCADE ON UPDATE CASCADE
)`

export const CREATE_IMPORTED_GAME_VERSION_TABLE = `CREATE TABLE IF NOT EXISTS imported_game_version (
    id      INTEGER    PRIMARY KEY AUTOINCREMENT,
    version TEXT       NOT NULL UNIQUE
)`

export const CREATE_HARVEST_TOOL_TABLE = `CREATE TABLE IF NOT EXISTS harvest_tool (
    id  INTEGER    PRIMARY KEY AUTOINCREMENT,
    key TEXT       NOT NULL UNIQUE
)`

export const CREATE_HARVEST_TOOL_QUALITY_TABLE = `CREATE TABLE IF NOT EXISTS harvest_tool_quality (
    id  INTEGER    PRIMARY KEY AUTOINCREMENT,
    key TEXT       NOT NULL UNIQUE
)`

export const CREATE_BLOCK_TABLE = `CREATE TABLE IF NOT EXISTS block (
    id                              INTEGER PRIMARY KEY AUTOINCREMENT,
    key                             TEXT    NOT NULL UNIQUE,
    title                           TEXT    UNIQUE,
    icon                            TEXT,
    icon_side_top                   TEXT,
    icon_side_left                  TEXT,
    icon_side_right                 TEXT,
    description                     TEXT,
    flammability_encouragement      INTEGER DEFAULT 0,
    flammability                    INTEGER DEFAULT 0,
    light_level                     INTEGER DEFAULT 0,
    min_spawn                       INTEGER DEFAULT 0,
    max_spawn                       INTEGER DEFAULT 0,
    namespace_id                    INTEGER,
    FOREIGN KEY (namespace_id) REFERENCES namespace (ingredient_for_blocks) ON DELETE CASCADE ON UPDATE CASCADE
)`

export const CREATE_HARVEST_TOOL_TO_BLOCK_TABLE = `CREATE TABLE IF NOT EXISTS harvest_tool_to_block (
    block_id                    INTEGER     NOT NULL,
    harvest_tool_id             INTEGER     NOT NULL,
    FOREIGN KEY (block_id) REFERENCES block (block_id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (harvest_tool_id) REFERENCES harvest_tool_quality (harvest_tool_id) ON DELETE CASCADE ON UPDATE CASCADE,
    PRIMARY KEY (block_id, harvest_tool_id)
)`

export const CREATE_HARVEST_TOOL_QUALITY_TO_BLOCK_TABLE = `CREATE TABLE IF NOT EXISTS harvest_tool_quality_to_block (
    block_id                    INTEGER     NOT NULL,
    harvest_tool_quality_id     INTEGER     NOT NULL,
    FOREIGN KEY (block_id) REFERENCES block (block_id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (harvest_tool_quality_id) REFERENCES harvest_tool (harvest_tool_quality_id) ON DELETE CASCADE ON UPDATE CASCADE,
    PRIMARY KEY (block_id, harvest_tool_quality_id)
)`

export const CREATE_BLOCK_TO_BLOCK_TABLE = `CREATE TABLE IF NOT EXISTS block_to_block (
    block_id_a                  INTEGER     NOT NULL,
    block_id_b                  INTEGER     NOT NULL,
    FOREIGN KEY (block_id_a) REFERENCES block (block_id_a) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (block_id_b) REFERENCES block (block_id_a) ON DELETE CASCADE ON UPDATE CASCADE,
    PRIMARY KEY (block_id_a, block_id_b)
)`
