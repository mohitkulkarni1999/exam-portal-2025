-- MySQL Database Setup for Exam Portal
-- Run these commands in MySQL Workbench or MySQL command line

-- Create database
CREATE DATABASE IF NOT EXISTS exam_portal;

-- Use the database
USE exam_portal;

-- Create user (optional - you can use root)
CREATE USER IF NOT EXISTS 'examportal'@'localhost' IDENTIFIED BY 'examportal123';

-- Grant privileges
GRANT ALL PRIVILEGES ON exam_portal.* TO 'examportal'@'localhost';
GRANT ALL PRIVILEGES ON exam_portal.* TO 'root'@'localhost';

-- Flush privileges
FLUSH PRIVILEGES;

-- Show databases to verify
SHOW DATABASES;
