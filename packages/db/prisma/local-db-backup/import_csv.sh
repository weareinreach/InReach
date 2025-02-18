#!/bin/bash

# Path to the directory containing CSV files
csv_dir="/Users/dmac1/Projects/InReach2/InReach/packages/db/prisma/db"

# Database connection URL
DATABASE_URL="postgres://user:password@localhost:5432/inreach"

# Log file to store the results
log_file="/Users/dmac1/Projects/InReach2/InReach/packages/db/prisma/db/logs/import_log.txt"
error_log_file="/Users/dmac1/Projects/InReach2/InReach/packages/db/prisma/db/logs/error_log.txt"

# Ensure the log directory exists
log_dir=$(dirname "$log_file")
error_log_dir=$(dirname "$error_log_file")

mkdir -p "$log_dir" "$error_log_dir"

# Clear previous logs
> "$log_file"
> "$error_log_file"

# Loop over each CSV file in the directory
for csv_file in "$csv_dir"/*.csv; do
  # Check if any CSV files were found
  if [ -e "$csv_file" ]; then
    # Extract the table name from the CSV filename
    table_name=$(basename "$csv_file" .csv)

    # Log the import attempt
    echo "Importing data into table: $table_name" | tee -a "$log_file"

    # Disable constraints for the current table
    echo "Disabling constraints for table: $table_name" | tee -a "$log_file"
    PGPASSWORD=$(echo $DATABASE_URL | sed 's/.*:\(.*\)@.*/\1/') psql $DATABASE_URL -c "ALTER TABLE public.\"$table_name\" DISABLE TRIGGER ALL" >> "$log_file" 2>&1

    # Run the \copy command using psql with the DATABASE_URL
    PGPASSWORD=$(echo $DATABASE_URL | sed 's/.*:\(.*\)@.*/\1/') psql $DATABASE_URL -c "\copy public.\"$table_name\" FROM '$csv_file' WITH CSV" >> "$log_file" 2>&1

    # Check for errors
    if [ $? -eq 0 ]; then
      echo "Successfully imported data into table $table_name" | tee -a "$log_file"
    else
      echo "Error importing data into table $table_name" | tee -a "$error_log_file"
      echo "$table_name" >> "$error_log_file"
    fi

    # Re-enable constraints for the current table
    echo "Re-enabling constraints for table: $table_name" | tee -a "$log_file"
    PGPASSWORD=$(echo $DATABASE_URL | sed 's/.*:\(.*\)@.*/\1/') psql $DATABASE_URL -c "ALTER TABLE public.\"$table_name\" ENABLE TRIGGER ALL" >> "$log_file" 2>&1

  else
    echo "No CSV files found in the directory." | tee -a "$log_file"
  fi
done

# After all imports, log which tables had errors
if [ -s "$error_log_file" ]; then
  echo "The following tables had errors during import:" >> "$log_file"
  cat "$error_log_file" >> "$log_file"
else
  echo "All tables were imported successfully." >> "$log_file"
fi
