#!/bin/bash

# Script untuk reset Turso database sebelum deployment
# Jalankan: bash scripts/reset-turso.sh

echo "🔧 Reset Turso Database Script"
echo "================================"
echo ""

# Check if turso CLI is installed
if ! command -v turso &> /dev/null
then
    echo "❌ Turso CLI not found!"
    echo "Install dengan: curl -sSfL https://get.tur.so/install.sh | bash"
    exit 1
fi

echo "✅ Turso CLI found"
echo ""

# Database name
DB_NAME="auth-gilbertt1214"

echo "📊 Current database info:"
turso db show $DB_NAME
echo ""

read -p "⚠️  Drop semua tables di database '$DB_NAME'? (y/n) " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]
then
    echo ""
    echo "🗑️  Dropping tables..."
    
    # Connect dan drop tables
    turso db shell $DB_NAME <<EOF
DROP TABLE IF EXISTS health_reminders;
DROP TABLE IF EXISTS medications;
DROP TABLE IF EXISTS health_goals;
DROP TABLE IF EXISTS disease_detections;
DROP TABLE IF EXISTS mental_health_assessments;
DROP TABLE IF EXISTS mental_health_logs;
DROP TABLE IF EXISTS family_members;
DROP TABLE IF EXISTS doctor_bookings;
DROP TABLE IF EXISTS medical_records;
DROP TABLE IF EXISTS emergency_alerts;
DROP TABLE IF EXISTS emergency_contacts;
DROP TABLE IF EXISTS health_metrics;
DROP TABLE IF EXISTS health_profiles;
DROP TABLE IF EXISTS users;
.tables
EOF
    
    echo ""
    echo "✅ Tables dropped!"
    echo ""
    echo "🔑 Generate token baru:"
    turso db tokens create $DB_NAME
    echo ""
    echo "📋 Copy token di atas dan set di Netlify environment variables!"
    echo ""
    echo "✅ Database siap untuk deployment!"
else
    echo ""
    echo "❌ Cancelled. No changes made."
fi
