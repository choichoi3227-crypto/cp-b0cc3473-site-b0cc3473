<?php
/**
 * CloudPress WordPress 설정 (자동 생성)
 * DB: GitHub 레포 내 _db/wordpress.db (SQLite)
 */

// ── SQLite 연동 (sqlite-database-integration 플러그인) ──
define( 'DB_NAME',     'wordpress' );
define( 'DB_USER',     'root' );
define( 'DB_PASSWORD', '' );
define( 'DB_HOST',     'localhost' );
define( 'DB_CHARSET',  'utf8mb4' );
define( 'DB_COLLATE',  '' );
define( 'table_prefix', 'wp_' );

// SQLite 플러그인 설정
define( 'SQLITE_DB_DIR',  __DIR__ . '/_db/' );
define( 'SQLITE_DB_FILE', 'wordpress.db' );

// ── 인증 키/솔트 ──
define( 'AUTH_KEY',         'wxj6n1m6bxdkz09pgzvznglc1avxdiai9ngup8y1pc0wf8in1e0vic8xfl10j5j3' );
define( 'SECURE_AUTH_KEY',  '66kb3nzzxqgzti4ofmje0sa5ym29bsp0xalgcvfi9o3ty4d30hy9420u2o164nuf' );
define( 'LOGGED_IN_KEY',    '5tf0x9pud3bowxs3uw7hmf18b9i8bsz2xdb6jdhspije5e43eg8jd8f8rd0k69bt' );
define( 'NONCE_KEY',        '1tnn2asqrvnl52m7ug8zvk9u0sj5tgt5ri9575644sc4gi0o53ouggk3un6ocus1' );
define( 'AUTH_SALT',        'bc3bzopz3vybncwkkm8ypyv04wrcgrsc0jvo0i3s127f5yknmv2vs5avdqqzmeq6' );
define( 'SECURE_AUTH_SALT', '4r3liicm79y1pnnpmp3jl9naqfs6m1g69o2bgemcpcfwfz53dsnl9mb966g9bjk0' );
define( 'LOGGED_IN_SALT',   'bthged6lcdyf8doc8fxz7hyjsnwio063u4hgbr5stsbp9q1bietzmdccs4xgovet' );
define( 'NONCE_SALT',       '1ho5p5barqdckjo48w5tyl5r99a7euiinijwuhy1venntxru74qaei9vidwmvv28' );

// ── URL 설정 ──
define( 'WP_HOME',    'https://cp-b0cc3473-wp.choichoi3227.workers.dev' );
define( 'WP_SITEURL', 'https://cp-b0cc3473-wp.choichoi3227.workers.dev' );

// ── 기타 ──
define( 'WP_DEBUG',        false );
define( 'WP_CACHE',        true  );
define( 'WP_AUTO_UPDATE_CORE', false );
define( 'DISALLOW_FILE_EDIT',  false );

if ( ! defined( 'ABSPATH' ) ) {
  define( 'ABSPATH', __DIR__ . '/' );
}
require_once ABSPATH . 'wp-settings.php';
