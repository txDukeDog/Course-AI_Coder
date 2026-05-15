CREATE TABLE organizations (
    id   INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT    NOT NULL
);

CREATE TABLE users (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    username      TEXT    NOT NULL UNIQUE,
    password_hash TEXT    NOT NULL,
    role          TEXT    NOT NULL DEFAULT 'user',
    org_id        INTEGER REFERENCES organizations(id)
);

CREATE TABLE boards (
    id      INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id),
    name    TEXT    NOT NULL,
    org_id  INTEGER REFERENCES organizations(id)
);

CREATE TABLE columns (
    id       INTEGER PRIMARY KEY AUTOINCREMENT,
    board_id INTEGER NOT NULL REFERENCES boards(id),
    name     TEXT    NOT NULL,
    position INTEGER NOT NULL
);

CREATE TABLE cards (
    id        INTEGER PRIMARY KEY AUTOINCREMENT,
    column_id INTEGER NOT NULL REFERENCES columns(id),
    title     TEXT    NOT NULL,
    details   TEXT    NOT NULL DEFAULT '',
    position  INTEGER NOT NULL
);

CREATE TABLE user_board_access (
    user_id  INTEGER NOT NULL REFERENCES users(id),
    board_id INTEGER NOT NULL REFERENCES boards(id),
    PRIMARY KEY (user_id, board_id)
);
