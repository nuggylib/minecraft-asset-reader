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

// TODO: link to items that block is component-to
export const CREATE_BLOCK_TABLE = `CREATE TABLE IF NOT EXISTS block (
    id                          INTEGER PRIMARY KEY AUTOINCREMENT,
    key                         TEXT    NOT NULL UNIQUE,
    title                       TEXT    UNIQUE,
    icon                        TEXT,
    description                 TEXT,
    flammability_encouragement  INTEGER DEFAULT 0,
    flammability                INTEGER DEFAULT 0,
    light_level                 INTEGER DEFAULT 0,
    min_spawn                   INTEGER DEFAULT 0,
    max_spawn                   INTEGER DEFAULT 0,
    harvest_tool_id             INTEGER,
    harvest_tool_quality_id     INTEGER,
    related_blocks              INTEGER,
    ingredient_for_blocks       INTEGER,
    FOREIGN KEY (harvest_tool_id) REFERENCES harvest_tool (harvest_tool_id) ON DELETE NO ACTION ON UPDATE NO ACTION,
    FOREIGN KEY (harvest_tool_quality_id) REFERENCES harvest_tool_quality (harvest_tool_quality_id) ON DELETE NO ACTION ON UPDATE NO ACTION,
    FOREIGN KEY (related_blocks) REFERENCES block (related_blocks) ON DELETE NO ACTION ON UPDATE NO ACTION,
    FOREIGN KEY (ingredient_for_blocks) REFERENCES block (ingredient_for_blocks) ON DELETE NO ACTION ON UPDATE NO ACTION
)`

export const CREATE_NAMESPACE_TABLE = `CREATE TABLE IF NOT EXISTS namespace (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    key         TEXT    NOT NULL UNIQUE,
    block_id    INTEGER,
    FOREIGN KEY (block_id) REFERENCES block (block_id) ON DELETE CASCADE ON UPDATE CASCADE
)`

export const CREATE_GAME_VERSION_TABLE = `CREATE TABLE IF NOT EXISTS game_version (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    key         TEXT    NOT NULL,
    namespace_id    INTEGER,
    FOREIGN KEY (namespace_id) REFERENCES namespace (namespace_id) ON DELETE CASCADE ON UPDATE CASCADE
)`
