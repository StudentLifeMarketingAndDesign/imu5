<?php

global $project;
$project = 'mysite';

global $database;
$database = 'imu5';
 
// Use _ss_environment.php file for configuration
require_once("conf/ConfigureFromEnv.php");

MySQLDatabase::set_connection_charset('utf8');

// Set the site locale
i18n::set_locale('en_US');
FulltextSearchable::enable();