#!/bin/bash

USER="root"
DB_NAME="mydb"

BACKUP_DIR='/home/opc/ECPP/mysql_backups'

DATE=$(date +\%F)

mysqldump -u $USER $DB_NAME > $BACKUP_DIR/$DB_NAME-$DATE.sql

find $BACKUP_DIR -name "*.sql" -type f -mtime +7 -exec rm {} \;
