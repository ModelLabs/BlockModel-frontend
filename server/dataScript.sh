echo "insert apikeys into database"
mysql --host=127.0.0.1 --port=33006 --user=root --password=123456 << EOF
CREATE DATABASE IF NOT EXISTS blockmodel_db
    DEFAULT CHARACTER SET utf8;
use blockmodel_db;

CREATE TABLE IF NOT EXISTS apikeys (
        _id INT AUTO_INCREMENT PRIMARY KEY,
        _apikey VARCHAR(64) NOT NULL, 
        _status INT NOT NULL
)ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE IF NOT EXISTS sessions (
        _id INT AUTO_INCREMENT PRIMARY KEY,
        _user VARCHAR(64) NOT NULL, 
        _apikey VARCHAR(64) NOT NULL,
        _createtime VARCHAR(64) NOT NULL,
        _calltimes INT NOT NULL
)ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE IF NOT EXISTS authcodes (
        _id INT AUTO_INCREMENT PRIMARY KEY,
        _user VARCHAR(64) NOT NULL, 
        _code VARCHAR(64) NOT NULL,
        _createtime VARCHAR(64) NOT NULL
)ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE IF NOT EXISTS models (
        _id INT AUTO_INCREMENT PRIMARY KEY,
        _name VARCHAR(64) NOT NULL COMMENT 'hash of flowable NFT metadata', 
        _modeldata longtext NOT NULL COMMENT 'json data of model',
        _params longtext NOT NULL COMMENT 'measure parameters',
        _result longtext NOT NULL COMMENT 'measure results',
        _status int DEFAULT 0 NOT NULL COMMENT 'padding or commit'
)ENGINE=InnoDB DEFAULT CHARSET=utf8;

INSERT INTO apikeys VALUES (
    null,
    "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",
    0
);
INSERT INTO apikeys VALUES (
    null,
    "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",
    0
);
INSERT INTO apikeys VALUES (
    null,
    "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",
    0
);
exit
EOF
echo "insertion completed"