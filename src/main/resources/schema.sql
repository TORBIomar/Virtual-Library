-- ============================================
-- Smart Library Database Schema
-- MySQL 8.x compatible
-- ============================================

-- Create the database
CREATE DATABASE IF NOT EXISTS smart_library_db
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE smart_library_db;

-- ============================================
-- 1. USERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS users (
    id BINARY(16) NOT NULL,
    username VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('READER', 'ADMIN') NOT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uk_users_username (username)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 2. BOOKS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS books (
    id BINARY(16) NOT NULL,
    title VARCHAR(255) NOT NULL,
    author VARCHAR(255) NOT NULL,
    summary TEXT,
    category VARCHAR(255),
    file_path VARCHAR(255),
    cover_image_url VARCHAR(255),
    PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 3. REVIEWS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS reviews (
    id BINARY(16) NOT NULL,
    user_id BINARY(16) NOT NULL,
    book_id BINARY(16) NOT NULL,
    rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment TEXT,
    created_at DATETIME(6) NOT NULL,
    PRIMARY KEY (id),
    KEY idx_reviews_user_id (user_id),
    KEY idx_reviews_book_id (book_id),
    CONSTRAINT fk_reviews_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT fk_reviews_book FOREIGN KEY (book_id) REFERENCES books (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 4. READ_LATER TABLE (Wishlist)
-- ============================================
CREATE TABLE IF NOT EXISTS read_later (
    id BINARY(16) NOT NULL,
    user_id BINARY(16) NOT NULL,
    book_id BINARY(16) NOT NULL,
    added_at DATETIME(6) NOT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uk_read_later_user_book (user_id, book_id),
    KEY idx_read_later_book_id (book_id),
    CONSTRAINT fk_read_later_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT fk_read_later_book FOREIGN KEY (book_id) REFERENCES books (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 5. READING_PROGRESS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS reading_progress (
    id BINARY(16) NOT NULL,
    user_id BINARY(16) NOT NULL,
    book_id BINARY(16) NOT NULL,
    current_page INT NOT NULL,
    total_pages INT NOT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uk_reading_progress_user_book (user_id, book_id),
    KEY idx_reading_progress_book_id (book_id),
    CONSTRAINT fk_reading_progress_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT fk_reading_progress_book FOREIGN KEY (book_id) REFERENCES books (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
