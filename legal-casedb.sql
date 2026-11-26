-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: zephyr.proxy.rlwy.net:18623
-- Generation Time: Nov 26, 2026 at 06:34 AM
-- Server version: 8.4.13
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `railway`
--

-- --------------------------------------------------------

--
-- Table structure for table `appeals_cases`
--

CREATE TABLE `appeals_cases` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `matter_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `appellate_court` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Utah Court of Appeals',
  `appellate_docket_number` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `lower_court_name` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `lower_court_docket_number` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `notice_of_appeal_date` date DEFAULT NULL,
  `record_due_deadline` date DEFAULT NULL,
  `opening_brief_deadline` date DEFAULT NULL,
  `reply_brief_deadline` date DEFAULT NULL,
  `oral_argument_date` datetime(3) DEFAULT NULL,
  `status` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Notice Filed',
  `appellant_role` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Appellant',
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `audit_logs`
--

CREATE TABLE `audit_logs` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_role` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `action` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `resource_type` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `resource_id` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `details` json NOT NULL,
  `ip_address` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_agent` text COLLATE utf8mb4_unicode_ci,
  `timestamp` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
) ;

--
-- Dumping data for table `audit_logs`
--

INSERT INTO `audit_logs` (`id`, `user_id`, `user_name`, `user_role`, `action`, `resource_type`, `resource_id`, `details`, `ip_address`, `user_agent`, `timestamp`) VALUES
('00c06b10-0025-49a6-9017-ac47b1ba9560', '66c97d44-096b-4d34-8bd1-5691ba855e23', 'Eleanor Heugly, Esq.', 'super_admin', 'USER_LOGIN_SUCCESS', 'AUTH', '66c97d44-096b-4d34-8bd1-5691ba855e23', '{\"role\": \"super_admin\", \"email\": \"e.heugly@utahslawyers.com\", \"rememberMe\": false}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36', '2026-11-16 12:50:40.617'),
('024537b1-877b-454a-975b-c1ad7778e144', '66c97d44-096b-4d34-8bd1-5691ba855e23', 'Eleanor Heugly, Esq.', 'super_admin', 'USER_LOGIN_SUCCESS', 'AUTH', '66c97d44-096b-4d34-8bd1-5691ba855e23', '{\"role\": \"super_admin\", \"email\": \"e.heugly@utahslawyers.com\", \"rememberMe\": false}', '::ffff:100.64.0.4', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36', '2026-11-16 10:41:37.748'),
('05a091f6-3e5c-4cdc-bd47-ddfc3b7a4a6d', '66c97d44-096b-4d34-8bd1-5691ba855e23', 'Eleanor Heugly, Esq.', 'super_admin', 'USER_LOGIN_SUCCESS', 'AUTH', '66c97d44-096b-4d34-8bd1-5691ba855e23', '{\"role\": \"super_admin\", \"email\": \"e.heugly@utahslawyers.com\", \"rememberMe\": false}', '::ffff:100.64.0.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36', '2026-11-25 06:49:04.712'),
('0732dc5b-a1c2-4554-9a6e-ba59bff90217', '66c97d44-096b-4d34-8bd1-5691ba855e23', 'Eleanor Heugly, Esq.', 'super_admin', 'USER_LOGIN_SUCCESS', 'AUTH', '66c97d44-096b-4d34-8bd1-5691ba855e23', '{\"role\": \"super_admin\", \"email\": \"e.heugly@utahslawyers.com\", \"rememberMe\": false}', '::ffff:100.64.0.8', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36', '2026-11-16 13:25:32.527'),
('08c008ca-69a0-4ab5-805d-785234d0cd89', '66c97d44-096b-4d34-8bd1-5691ba855e23', 'Eleanor Heugly, Esq.', 'super_admin', 'USER_LOGIN_SUCCESS', 'AUTH', '66c97d44-096b-4d34-8bd1-5691ba855e23', '{\"role\": \"super_admin\", \"email\": \"e.heugly@utahslawyers.com\", \"rememberMe\": false}', '::ffff:100.64.0.4', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36', '2026-11-16 12:14:19.514'),
('096e6bda-6049-40b9-920b-f27be3c8dcd6', '8640f71a-0142-42f4-a4c0-732537dcd9b7', 'Thomas Bludworth, Esq.', 'attorney', 'USER_LOGIN_SUCCESS', 'AUTH', '8640f71a-0142-42f4-a4c0-732537dcd9b7', '{\"role\": \"attorney\", \"email\": \"t.bludworth@utahslawyers.com\", \"rememberMe\": false}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36', '2026-11-16 11:43:20.333'),
('0ab02859-5399-48dd-9bf4-7d8c9d8fe0ed', '66c97d44-096b-4d34-8bd1-5691ba855e23', 'Eleanor Heugly, Esq.', 'super_admin', 'USER_LOGIN_SUCCESS', 'AUTH', '66c97d44-096b-4d34-8bd1-5691ba855e23', '{\"role\": \"super_admin\", \"email\": \"e.heugly@utahslawyers.com\", \"rememberMe\": false}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36', '2026-11-16 10:25:16.513'),
('0ca0099b-e8fc-41dc-89c2-2fec8d035dd1', '66c97d44-096b-4d34-8bd1-5691ba855e23', 'Eleanor Heugly, Esq.', 'super_admin', 'USER_LOGIN_SUCCESS', 'AUTH', '66c97d44-096b-4d34-8bd1-5691ba855e23', '{\"role\": \"super_admin\", \"email\": \"e.heugly@utahslawyers.com\", \"rememberMe\": false}', '::ffff:100.64.0.16', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36', '2026-11-16 11:10:26.735'),
('0d692ea9-c629-4f05-b324-5b5a76d8d9b8', '66c97d44-096b-4d34-8bd1-5691ba855e23', 'Eleanor Heugly, Esq.', 'super_admin', 'USER_LOGIN_SUCCESS', 'AUTH', '66c97d44-096b-4d34-8bd1-5691ba855e23', '{\"role\": \"super_admin\", \"email\": \"e.heugly@utahslawyers.com\", \"rememberMe\": false}', '::ffff:100.64.0.9', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36', '2026-11-16 12:07:54.280'),
('1023b4b1-9c18-4227-a247-0bfd9b5f661a', '66c97d44-096b-4d34-8bd1-5691ba855e23', 'SYSTEM', 'super_admin', 'DOCUMENT_CREATED', 'DOCUMENT', '62021eb8-345e-4522-9f4e-29df81aa37de', '{\"title\": \"yj\", \"documentCode\": \"DOC-26-0001\", \"matterNumber\": \"26-FAM-0101\"}', '::ffff:100.64.0.13', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36', '2026-11-17 07:29:56.365'),
('174d6717-3c7c-444f-ada4-4b311376868b', '66c97d44-096b-4d34-8bd1-5691ba855e23', 'Eleanor Heugly, Esq.', 'super_admin', 'USER_LOGIN_SUCCESS', 'AUTH', '66c97d44-096b-4d34-8bd1-5691ba855e23', '{\"role\": \"super_admin\", \"email\": \"e.heugly@utahslawyers.com\", \"rememberMe\": false}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36', '2026-11-25 10:39:38.551'),
('181187d0-a1f9-401e-bd5e-d2270fefd68d', '8640f71a-0142-42f4-a4c0-732537dcd9b7', 'Thomas Bludworth, Esq.', 'attorney', 'USER_LOGIN_SUCCESS', 'AUTH', '8640f71a-0142-42f4-a4c0-732537dcd9b7', '{\"role\": \"attorney\", \"email\": \"t.bludworth@utahslawyers.com\", \"rememberMe\": false}', '::ffff:100.64.0.3', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36', '2026-11-19 05:31:28.496'),
('1940289a-2430-440d-87a7-e8c00c53e92c', '8640f71a-0142-42f4-a4c0-732537dcd9b7', 'Thomas Bludworth, Esq.', 'attorney', 'USER_LOGIN_SUCCESS', 'AUTH', '8640f71a-0142-42f4-a4c0-732537dcd9b7', '{\"role\": \"attorney\", \"email\": \"t.bludworth@utahslawyers.com\", \"rememberMe\": false}', '::ffff:100.64.0.17', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36', '2026-11-16 13:32:53.345'),
('1a693a30-3ca2-480b-b539-df741f2b7758', '66c97d44-096b-4d34-8bd1-5691ba855e23', 'Eleanor Heugly, Esq.', 'super_admin', 'USER_LOGIN_SUCCESS', 'AUTH', '66c97d44-096b-4d34-8bd1-5691ba855e23', '{\"role\": \"super_admin\", \"email\": \"e.heugly@utahslawyers.com\", \"rememberMe\": false}', '::ffff:100.64.0.9', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36', '2026-11-18 05:41:30.896'),
('1b3e2b85-f546-4878-bea1-1f9e68adedb2', '66c97d44-096b-4d34-8bd1-5691ba855e23', 'Eleanor Heugly, Esq.', 'super_admin', 'USER_LOGIN_SUCCESS', 'AUTH', '66c97d44-096b-4d34-8bd1-5691ba855e23', '{\"role\": \"super_admin\", \"email\": \"e.heugly@utahslawyers.com\", \"rememberMe\": false}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/158.0.0.0 Safari/537.36 Edg/158.0.0.0', '2026-11-25 10:13:00.095'),
('1d471bd3-e171-439d-92d8-6d701c1541d9', '66c97d44-096b-4d34-8bd1-5691ba855e23', 'Eleanor Heugly, Esq.', 'super_admin', 'USER_LOGIN_SUCCESS', 'AUTH', '66c97d44-096b-4d34-8bd1-5691ba855e23', '{\"role\": \"super_admin\", \"email\": \"e.heugly@utahslawyers.com\", \"rememberMe\": false}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36', '2026-11-25 11:44:10.862'),
('1e313fbb-191b-4df9-b8ac-c0b11c3a7098', '66c97d44-096b-4d34-8bd1-5691ba855e23', 'Eleanor Heugly, Esq.', 'super_admin', 'USER_LOGIN_SUCCESS', 'AUTH', '66c97d44-096b-4d34-8bd1-5691ba855e23', '{\"role\": \"super_admin\", \"email\": \"e.heugly@utahslawyers.com\", \"rememberMe\": false}', '::ffff:100.64.0.4', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0', '2026-11-17 06:08:52.816'),
('2362fb77-2963-4ab6-b8be-f0a9e07f1d44', '66c97d44-096b-4d34-8bd1-5691ba855e23', 'Eleanor Heugly, Esq.', 'super_admin', 'USER_LOGIN_SUCCESS', 'AUTH', '66c97d44-096b-4d34-8bd1-5691ba855e23', '{\"role\": \"super_admin\", \"email\": \"e.heugly@utahslawyers.com\", \"rememberMe\": false}', '::ffff:100.64.0.7', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36', '2026-11-17 06:05:11.514'),
('2660cc83-7704-4ec0-8330-f5c70c069724', '66c97d44-096b-4d34-8bd1-5691ba855e23', 'Eleanor Heugly, Esq.', 'super_admin', 'USER_LOGIN_SUCCESS', 'AUTH', '66c97d44-096b-4d34-8bd1-5691ba855e23', '{\"role\": \"super_admin\", \"email\": \"e.heugly@utahslawyers.com\", \"rememberMe\": false}', '::ffff:100.64.0.16', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1', '2026-11-17 06:31:00.059'),
('26fb6207-b98b-4fe2-9fb9-f4efb16e458e', '66c97d44-096b-4d34-8bd1-5691ba855e23', 'Eleanor Heugly, Esq.', 'super_admin', 'USER_LOGIN_SUCCESS', 'AUTH', '66c97d44-096b-4d34-8bd1-5691ba855e23', '{\"role\": \"super_admin\", \"email\": \"e.heugly@utahslawyers.com\", \"rememberMe\": false}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/158.0.0.0 Safari/537.36', '2026-11-25 08:47:13.560'),
('2715589d-707d-4e34-a590-dcafa3ac416e', 'eca5d99f-a1cd-43f8-82f2-830acd1a5ddc', 'David Sterling, Esq.', 'supervisor', 'USER_LOGIN_SUCCESS', 'AUTH', 'eca5d99f-a1cd-43f8-82f2-830acd1a5ddc', '{\"role\": \"supervisor\", \"email\": \"d.sterling@utahslawyers.com\", \"rememberMe\": false}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36', '2026-11-16 11:43:49.665'),
('27cd52cc-650d-4b5d-b074-4fd473bfcb15', '66c97d44-096b-4d34-8bd1-5691ba855e23', 'Eleanor Heugly, Esq.', 'super_admin', 'USER_LOGIN_SUCCESS', 'AUTH', '66c97d44-096b-4d34-8bd1-5691ba855e23', '{\"role\": \"super_admin\", \"email\": \"e.heugly@utahslawyers.com\", \"rememberMe\": false}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/158.0.0.0 Safari/537.36', '2026-11-25 08:40:02.864'),
('2eef9b0c-fd81-40c7-99c3-eafe71f74f11', '66c97d44-096b-4d34-8bd1-5691ba855e23', 'Eleanor Heugly, Esq.', 'super_admin', 'USER_LOGIN_SUCCESS', 'AUTH', '66c97d44-096b-4d34-8bd1-5691ba855e23', '{\"role\": \"super_admin\", \"email\": \"e.heugly@utahslawyers.com\", \"rememberMe\": false}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36', '2026-11-25 09:24:42.000'),
('323605bb-e4d8-480f-8678-1277675a326c', '66c97d44-096b-4d34-8bd1-5691ba855e23', 'SYSTEM', 'super_admin', 'TASK_CREATED', 'TASK', 'f1b9c35d-4f46-4bdb-84f1-f728ab414c7a', '{\"title\": \"tttt\", \"taskCode\": \"TSK-26-0001\", \"matterNumber\": \"26-FAM-0101\"}', '::ffff:100.64.0.18', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36', '2026-11-16 12:04:21.057'),
('3ba58a56-c2e9-4379-9f6e-65519beaa7fd', '66c97d44-096b-4d34-8bd1-5691ba855e23', 'e.heugly@utahslawyers.com', 'super_admin', 'MATTER_CREATED', 'MATTER', 'fdefc7e3-861c-4838-a38a-f580b6c59e8b', '{\"title\": \"david john v. thomas\", \"clientName\": \"david john\", \"billingType\": \"Hourly\", \"matterNumber\": \"26-FAM-0101\", \"practiceArea\": \"Family Law\", \"isEthicalWallEnabled\": false}', '::ffff:100.64.0.2', 'Mozilla/5.0 (X11; Linux aarch64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 CrKey/1.54.250320', '2026-11-16 11:18:48.703'),
('3cd21a4a-e2ec-41bc-88c5-ed5299383e87', '8640f71a-0142-42f4-a4c0-732537dcd9b7', 'Thomas Bludworth, Esq.', 'attorney', 'USER_LOGIN_SUCCESS', 'AUTH', '8640f71a-0142-42f4-a4c0-732537dcd9b7', '{\"role\": \"attorney\", \"email\": \"t.bludworth@utahslawyers.com\", \"rememberMe\": false}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/158.0.0.0 Safari/537.36', '2026-11-26 05:32:43.149'),
('40cb22e2-1dba-49e0-bed9-d0bc74e23979', '66c97d44-096b-4d34-8bd1-5691ba855e23', 'SYSTEM', 'super_admin', 'TEMPLATE_STATUS_CHANGED', 'DOCUMENT_TEMPLATE', '47a69abb-1d3b-4d63-998b-49a7a632aa69', '{\"isActive\": false, \"templateCode\": \"112\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/158.0.0.0 Safari/537.36', '2026-11-25 09:08:11.919'),
('448f9486-1b58-4f59-bdb7-ecae14203835', '66c97d44-096b-4d34-8bd1-5691ba855e23', 'SYSTEM', 'super_admin', 'TASK_STATUS_UPDATED', 'TASK', 'f1b9c35d-4f46-4bdb-84f1-f728ab414c7a', '{\"status\": \"Completed\", \"taskCode\": \"TSK-26-0001\"}', '::ffff:100.64.0.21', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36', '2026-11-17 07:44:12.678'),
('49796e26-c581-4bf9-b90d-ef28610e1ec1', '66c97d44-096b-4d34-8bd1-5691ba855e23', 'Eleanor Heugly, Esq.', 'super_admin', 'USER_LOGIN_SUCCESS', 'AUTH', '66c97d44-096b-4d34-8bd1-5691ba855e23', '{\"role\": \"super_admin\", \"email\": \"e.heugly@utahslawyers.com\", \"rememberMe\": false}', '::ffff:100.64.0.3', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36', '2026-11-16 11:10:26.469'),
('4ae44107-f1fb-47ab-9512-95c9c8676fa1', '66c97d44-096b-4d34-8bd1-5691ba855e23', 'Eleanor Heugly, Esq.', 'super_admin', 'USER_LOGIN_SUCCESS', 'AUTH', '66c97d44-096b-4d34-8bd1-5691ba855e23', '{\"role\": \"super_admin\", \"email\": \"e.heugly@utahslawyers.com\", \"rememberMe\": false}', '::ffff:100.64.0.20', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36', '2026-11-17 05:44:10.533'),
('4ce874ca-6456-434b-9b90-7dde540535db', '8640f71a-0142-42f4-a4c0-732537dcd9b7', 'Thomas Bludworth, Esq.', 'attorney', 'USER_LOGIN_SUCCESS', 'AUTH', '8640f71a-0142-42f4-a4c0-732537dcd9b7', '{\"role\": \"attorney\", \"email\": \"t.bludworth@utahslawyers.com\", \"rememberMe\": false}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36', '2026-11-16 12:08:58.462'),
('4d36e8d9-0384-4115-a62f-26a394a5f7e7', '66c97d44-096b-4d34-8bd1-5691ba855e23', 'Eleanor Heugly, Esq.', 'super_admin', 'USER_LOGIN_SUCCESS', 'AUTH', '66c97d44-096b-4d34-8bd1-5691ba855e23', '{\"role\": \"super_admin\", \"email\": \"e.heugly@utahslawyers.com\", \"rememberMe\": false}', '::ffff:100.64.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36', '2026-11-16 12:46:20.333'),
('50114fd9-a2b2-4aa4-83c6-0c893c9405bb', '66c97d44-096b-4d34-8bd1-5691ba855e23', 'SYSTEM', 'super_admin', 'DOCUMENT_DELETED', 'DOCUMENT', '62021eb8-345e-4522-9f4e-29df81aa37de', '{\"title\": \"yj\", \"documentCode\": \"DOC-26-0001\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/158.0.0.0 Safari/537.36', '2026-11-26 05:31:56.351'),
('55e358b6-d6b8-4e5f-b8e5-33ad464135fb', '66c97d44-096b-4d34-8bd1-5691ba855e23', 'Eleanor Heugly, Esq.', 'super_admin', 'USER_LOGIN_SUCCESS', 'AUTH', '66c97d44-096b-4d34-8bd1-5691ba855e23', '{\"role\": \"super_admin\", \"email\": \"e.heugly@utahslawyers.com\", \"rememberMe\": false}', '::ffff:100.64.0.10', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36', '2026-11-19 05:31:14.027'),
('591cf4d6-00c4-4ba7-b4fe-1ff8c8bc3508', '66c97d44-096b-4d34-8bd1-5691ba855e23', 'Eleanor Heugly, Esq.', 'super_admin', 'USER_LOGIN_SUCCESS', 'AUTH', '66c97d44-096b-4d34-8bd1-5691ba855e23', '{\"role\": \"super_admin\", \"email\": \"e.heugly@utahslawyers.com\", \"rememberMe\": false}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36', '2026-11-16 11:45:06.278'),
('5cd4b670-24d9-49dd-a9b2-28dd6617e65b', '66c97d44-096b-4d34-8bd1-5691ba855e23', 'Eleanor Heugly, Esq.', 'super_admin', 'USER_LOGIN_SUCCESS', 'AUTH', '66c97d44-096b-4d34-8bd1-5691ba855e23', '{\"role\": \"super_admin\", \"email\": \"e.heugly@utahslawyers.com\", \"rememberMe\": false}', '::ffff:100.64.0.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36', '2026-11-16 13:28:43.684'),
('5d94fed4-015e-4dff-9383-93f9551765e4', '66c97d44-096b-4d34-8bd1-5691ba855e23', 'Eleanor Heugly, Esq.', 'super_admin', 'USER_LOGIN_SUCCESS', 'AUTH', '66c97d44-096b-4d34-8bd1-5691ba855e23', '{\"role\": \"super_admin\", \"email\": \"e.heugly@utahslawyers.com\", \"rememberMe\": false}', '::1', 'Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9711', '2026-11-16 11:13:41.673'),
('6525d2e5-8fe4-471a-b2a1-1be6b074eb1c', '66c97d44-096b-4d34-8bd1-5691ba855e23', 'e.heugly@utahslawyers.com', 'super_admin', 'CLIENT_CREATED', 'CLIENT', 'b23414a1-b309-44c9-8097-bb3fc368222d', '{\"name\": \"david john\", \"status\": \"Active\", \"clientType\": \"Organization\", \"clientNumber\": \"CLI-1001\", \"assignedAttorneyId\": \"66c97d44-096b-4d34-8bd1-5691ba855e23\"}', '::ffff:100.64.0.9', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36', '2026-11-16 11:15:26.293'),
('6669e25c-4fda-4e6b-8d6d-1db6b169a56f', '66c97d44-096b-4d34-8bd1-5691ba855e23', 'Eleanor Heugly, Esq.', 'super_admin', 'USER_LOGIN_SUCCESS', 'AUTH', '66c97d44-096b-4d34-8bd1-5691ba855e23', '{\"role\": \"super_admin\", \"email\": \"e.heugly@utahslawyers.com\", \"rememberMe\": false}', '::ffff:100.64.0.11', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36', '2026-11-17 06:05:32.524'),
('6ab917d2-ab92-42d1-95be-36bc53aff811', 'eca5d99f-a1cd-43f8-82f2-830acd1a5ddc', 'David Sterling, Esq.', 'supervisor', 'USER_LOGIN_SUCCESS', 'AUTH', 'eca5d99f-a1cd-43f8-82f2-830acd1a5ddc', '{\"role\": \"supervisor\", \"email\": \"d.sterling@utahslawyers.com\", \"rememberMe\": false}', '::ffff:100.64.0.10', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36', '2026-11-19 05:31:40.866'),
('6b7abece-aafd-4d20-a018-1453c3a2255e', '66c97d44-096b-4d34-8bd1-5691ba855e23', 'Eleanor Heugly, Esq.', 'super_admin', 'USER_LOGIN_SUCCESS', 'AUTH', '66c97d44-096b-4d34-8bd1-5691ba855e23', '{\"role\": \"super_admin\", \"email\": \"e.heugly@utahslawyers.com\", \"rememberMe\": false}', '::ffff:100.64.0.3', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36', '2026-11-16 13:30:29.596'),
('6c197683-35e6-4ce0-9ec0-22d07c9400ff', '66c97d44-096b-4d34-8bd1-5691ba855e23', 'Eleanor Heugly, Esq.', 'super_admin', 'USER_LOGIN_SUCCESS', 'AUTH', '66c97d44-096b-4d34-8bd1-5691ba855e23', '{\"role\": \"super_admin\", \"email\": \"e.heugly@utahslawyers.com\", \"rememberMe\": false}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36', '2026-11-25 07:21:34.646'),
('6c2833f3-302c-4c63-bdbb-a744a267ae75', '66c97d44-096b-4d34-8bd1-5691ba855e23', 'Eleanor Heugly, Esq.', 'super_admin', 'USER_LOGIN_SUCCESS', 'AUTH', '66c97d44-096b-4d34-8bd1-5691ba855e23', '{\"role\": \"super_admin\", \"email\": \"e.heugly@utahslawyers.com\", \"rememberMe\": false}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36', '2026-11-16 11:53:02.399'),
('6e100f18-4c22-4ff7-9ecc-5cbd659e3524', '66c97d44-096b-4d34-8bd1-5691ba855e23', 'SYSTEM', 'super_admin', 'TASK_STATUS_UPDATED', 'TASK', 'f1b9c35d-4f46-4bdb-84f1-f728ab414c7a', '{\"status\": \"In Progress\", \"taskCode\": \"TSK-26-0001\"}', '::ffff:100.64.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36', '2026-11-16 12:05:12.244'),
('77fd6702-e2a3-4cd7-b5e8-53139978b0b5', '66c97d44-096b-4d34-8bd1-5691ba855e23', 'Eleanor Heugly, Esq.', 'super_admin', 'USER_LOGIN_SUCCESS', 'AUTH', '66c97d44-096b-4d34-8bd1-5691ba855e23', '{\"role\": \"super_admin\", \"email\": \"e.heugly@utahslawyers.com\", \"rememberMe\": false}', '::ffff:100.64.0.17', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36', '2026-11-25 13:21:11.158'),
('7dac3aa9-b067-46db-9aa3-d95760ea9758', '66c97d44-096b-4d34-8bd1-5691ba855e23', 'Eleanor Heugly, Esq.', 'super_admin', 'USER_LOGIN_SUCCESS', 'AUTH', '66c97d44-096b-4d34-8bd1-5691ba855e23', '{\"role\": \"super_admin\", \"email\": \"e.heugly@utahslawyers.com\", \"rememberMe\": false}', '::ffff:100.64.0.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36', '2026-11-17 06:04:15.172'),
('7dc04860-b337-44cc-badb-1f60f761e4a1', '66c97d44-096b-4d34-8bd1-5691ba855e23', 'Eleanor Heugly, Esq.', 'super_admin', 'USER_LOGIN_SUCCESS', 'AUTH', '66c97d44-096b-4d34-8bd1-5691ba855e23', '{\"role\": \"super_admin\", \"email\": \"e.heugly@utahslawyers.com\", \"rememberMe\": false}', '::ffff:100.64.0.20', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36', '2026-11-16 11:33:56.183'),
('7e2a9e9f-6fd1-499f-ae16-d850b9f336ce', '66c97d44-096b-4d34-8bd1-5691ba855e23', 'Eleanor Heugly, Esq.', 'super_admin', 'USER_LOGIN_SUCCESS', 'AUTH', '66c97d44-096b-4d34-8bd1-5691ba855e23', '{\"role\": \"super_admin\", \"email\": \"e.heugly@utahslawyers.com\", \"rememberMe\": false}', '::ffff:100.64.0.4', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36', '2026-11-16 13:16:00.064'),
('8202c33b-a9b7-4a48-af2d-3b7d402af7be', '66c97d44-096b-4d34-8bd1-5691ba855e23', 'Eleanor Heugly, Esq.', 'super_admin', 'USER_LOGIN_SUCCESS', 'AUTH', '66c97d44-096b-4d34-8bd1-5691ba855e23', '{\"role\": \"super_admin\", \"email\": \"e.heugly@utahslawyers.com\", \"rememberMe\": false}', '::ffff:100.64.0.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36', '2026-11-25 13:12:04.540'),
('84d10d7e-c853-4154-9ee6-a89afb5c55e5', '66c97d44-096b-4d34-8bd1-5691ba855e23', 'Eleanor Heugly, Esq.', 'super_admin', 'USER_LOGIN_SUCCESS', 'AUTH', '66c97d44-096b-4d34-8bd1-5691ba855e23', '{\"role\": \"super_admin\", \"email\": \"e.heugly@utahslawyers.com\", \"rememberMe\": false}', '::ffff:100.64.0.15', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36', '2026-11-17 06:21:13.218'),
('9318823c-8d1c-4668-84fe-d4f3f47a47dd', '66c97d44-096b-4d34-8bd1-5691ba855e23', 'e.heugly@utahslawyers.com', 'super_admin', 'USER_DEACTIVATED', 'USER', 'af3744b3-df06-4041-bc27-b8d16a8903d7', '{\"newStatus\": \"Inactive\", \"targetEmail\": \"t.bludworth.1794562768462@utahslawyers.com\", \"previousStatus\": \"Active\", \"targetUserCode\": \"USR-003\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36', '2026-11-16 11:58:51.157'),
('95a4ba5a-1a13-4676-9271-9f211d2d6b22', '66c97d44-096b-4d34-8bd1-5691ba855e23', 'Eleanor Heugly, Esq.', 'super_admin', 'USER_LOGIN_SUCCESS', 'AUTH', '66c97d44-096b-4d34-8bd1-5691ba855e23', '{\"role\": \"super_admin\", \"email\": \"e.heugly@utahslawyers.com\", \"rememberMe\": false}', '::ffff:100.64.0.5', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36', '2026-11-24 19:55:20.506'),
('96a02e6d-2717-43e8-9314-d5b1f7604e12', '66c97d44-096b-4d34-8bd1-5691ba855e23', 'Eleanor Heugly, Esq.', 'super_admin', 'USER_LOGIN_SUCCESS', 'AUTH', '66c97d44-096b-4d34-8bd1-5691ba855e23', '{\"role\": \"super_admin\", \"email\": \"e.heugly@utahslawyers.com\", \"rememberMe\": false}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36', '2026-11-16 13:17:58.184'),
('97be3700-739c-4c22-9084-4bd75e750cc0', '66c97d44-096b-4d34-8bd1-5691ba855e23', 'SYSTEM', 'super_admin', 'INTAKE_CREATED', 'INTAKE', 'a599c7c8-3ef7-4960-a38d-32eecf00fc08', '{\"intakeNumber\": \"INT-26-0001\", \"prospectiveClient\": \"david john\"}', '::ffff:100.64.0.18', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36', '2026-11-16 11:14:47.338'),
('9c74e79e-fb26-4a9a-a98a-46edea5a7c64', '66c97d44-096b-4d34-8bd1-5691ba855e23', 'Eleanor Heugly, Esq.', 'super_admin', 'USER_LOGIN_SUCCESS', 'AUTH', '66c97d44-096b-4d34-8bd1-5691ba855e23', '{\"role\": \"super_admin\", \"email\": \"e.heugly@utahslawyers.com\", \"rememberMe\": false}', '::ffff:100.64.0.13', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36', '2026-11-17 07:29:13.965'),
('9c800aaa-3b5f-436f-85a8-6c40f6249a8f', '66c97d44-096b-4d34-8bd1-5691ba855e23', 'e.heugly@utahslawyers.com', 'super_admin', 'MATTER_UPDATED', 'MATTER', 'fdefc7e3-861c-4838-a38a-f580b6c59e8b', '{\"changes\": {\"judge\": \"Hon. Elizabeth A. Hruby-Mills\", \"title\": \"david john v. thomas\", \"budget\": 30000, \"status\": \"Active\", \"courtName\": \"abc\", \"hourlyRate\": 4500, \"billingType\": \"Hourly\", \"description\": \"divorce.......\", \"flatFeeAmount\": null, \"nextCourtDate\": \"2026-11-26T00:00:00.000Z\", \"practiceAreaId\": \"pa-fam\", \"isEthicalWallEnabled\": false, \"statuteOfLimitations\": \"2026-11-24\", \"contingencyPercentage\": null, \"responsibleAttorneyId\": \"8640f71a-0142-42f4-a4c0-732537dcd9b7\", \"ethicalWallExcludedRole\": \"Paralegal Staff\"}, \"matterNumber\": \"26-FAM-0101\"}', '::ffff:100.64.0.11', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36', '2026-11-16 11:37:21.232'),
('9ceef514-d493-4e84-b6e9-ac29b30d1ab9', '66c97d44-096b-4d34-8bd1-5691ba855e23', 'SYSTEM', 'super_admin', 'INTAKE_CONFLICT_REVIEWED', 'INTAKE', 'a599c7c8-3ef7-4960-a38d-32eecf00fc08', '{\"notes\": \"Zero adverse party or prior representation conflicts identified across active rosters, closed files, and corporate affiliates for query \\\"thomas\\\". Cleared under Utah RPC 1.7.\", \"conflictStatus\": \"Cleared\"}', '::ffff:100.64.0.3', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36', '2026-11-16 11:15:14.652'),
('a052414a-cc3b-4577-9291-ffdec34f20a7', '66c97d44-096b-4d34-8bd1-5691ba855e23', 'Eleanor Heugly, Esq.', 'super_admin', 'USER_LOGIN_SUCCESS', 'AUTH', '66c97d44-096b-4d34-8bd1-5691ba855e23', '{\"role\": \"super_admin\", \"email\": \"e.heugly@utahslawyers.com\", \"rememberMe\": false}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/158.0.0.0 Safari/537.36', '2026-11-26 04:57:38.875'),
('a74e9e51-17d5-4c75-9be5-2c368fe3b002', '66c97d44-096b-4d34-8bd1-5691ba855e23', 'SYSTEM', 'super_admin', 'TASK_STATUS_UPDATED', 'TASK', 'f1b9c35d-4f46-4bdb-84f1-f728ab414c7a', '{\"status\": \"Completed\", \"taskCode\": \"TSK-26-0001\"}', '::ffff:100.64.0.18', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36', '2026-11-17 07:43:56.512'),
('a9d8a2da-546c-4608-b61f-fed122dd6687', '66c97d44-096b-4d34-8bd1-5691ba855e23', 'Eleanor Heugly, Esq.', 'super_admin', 'USER_LOGIN_SUCCESS', 'AUTH', '66c97d44-096b-4d34-8bd1-5691ba855e23', '{\"role\": \"super_admin\", \"email\": \"e.heugly@utahslawyers.com\", \"rememberMe\": false}', '::ffff:100.64.0.3', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36', '2026-11-16 11:52:48.041'),
('ae8fe8a7-a4a0-496f-abdf-719c5e5586dc', '66c97d44-096b-4d34-8bd1-5691ba855e23', 'Eleanor Heugly, Esq.', 'super_admin', 'USER_LOGIN_SUCCESS', 'AUTH', '66c97d44-096b-4d34-8bd1-5691ba855e23', '{\"role\": \"super_admin\", \"email\": \"e.heugly@utahslawyers.com\", \"rememberMe\": false}', '::ffff:100.64.0.17', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36', '2026-11-19 11:12:14.171'),
('afa26da2-9f43-46d7-b7d1-57543c36a013', '66c97d44-096b-4d34-8bd1-5691ba855e23', 'Eleanor Heugly, Esq.', 'super_admin', 'USER_LOGIN_SUCCESS', 'AUTH', '66c97d44-096b-4d34-8bd1-5691ba855e23', '{\"role\": \"super_admin\", \"email\": \"e.heugly@utahslawyers.com\", \"rememberMe\": false}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36', '2026-11-16 11:23:46.825'),
('b2c288e0-d4e0-4785-8db4-b5933f70f7b2', '66c97d44-096b-4d34-8bd1-5691ba855e23', 'Eleanor Heugly, Esq.', 'super_admin', 'USER_LOGIN_SUCCESS', 'AUTH', '66c97d44-096b-4d34-8bd1-5691ba855e23', '{\"role\": \"super_admin\", \"email\": \"e.heugly@utahslawyers.com\", \"rememberMe\": false}', '::ffff:100.64.0.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36', '2026-11-25 13:20:36.714'),
('ba55fdf7-239e-48f0-910c-284ae494ce68', '66c97d44-096b-4d34-8bd1-5691ba855e23', 'Eleanor Heugly, Esq.', 'super_admin', 'USER_LOGIN_SUCCESS', 'AUTH', '66c97d44-096b-4d34-8bd1-5691ba855e23', '{\"role\": \"super_admin\", \"email\": \"e.heugly@utahslawyers.com\", \"rememberMe\": false}', '::ffff:100.64.0.9', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36', '2026-11-19 06:34:35.209'),
('bb8c0328-ab56-43f0-a8c3-6cd99a597da3', '66c97d44-096b-4d34-8bd1-5691ba855e23', 'Eleanor Heugly, Esq.', 'super_admin', 'USER_LOGIN_SUCCESS', 'AUTH', '66c97d44-096b-4d34-8bd1-5691ba855e23', '{\"role\": \"super_admin\", \"email\": \"e.heugly@utahslawyers.com\", \"rememberMe\": false}', '::ffff:100.64.0.12', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36', '2026-11-17 06:24:30.224'),
('bc37c4d3-4584-465d-bf16-01c24b227839', '66c97d44-096b-4d34-8bd1-5691ba855e23', 'Eleanor Heugly, Esq.', 'super_admin', 'USER_LOGIN_SUCCESS', 'AUTH', '66c97d44-096b-4d34-8bd1-5691ba855e23', '{\"role\": \"super_admin\", \"email\": \"e.heugly@utahslawyers.com\", \"rememberMe\": false}', '::ffff:100.64.0.16', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36', '2026-11-16 12:23:50.532'),
('bea03879-b949-4f74-a01a-aac72c5a789f', '66c97d44-096b-4d34-8bd1-5691ba855e23', 'e.heugly@utahslawyers.com', 'super_admin', 'USER_DEACTIVATED', 'USER', 'b4144e13-e1b8-4c10-bc62-3ca0966380e0', '{\"newStatus\": \"Inactive\", \"targetEmail\": \"r.adams@utahslawyers.com\", \"previousStatus\": \"Active\", \"targetUserCode\": \"USR-007\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36', '2026-11-16 11:59:04.797'),
('c99dc503-6e02-44fe-9328-b21b8680af4a', '66c97d44-096b-4d34-8bd1-5691ba855e23', 'Eleanor Heugly, Esq.', 'super_admin', 'USER_LOGIN_SUCCESS', 'AUTH', '66c97d44-096b-4d34-8bd1-5691ba855e23', '{\"role\": \"super_admin\", \"email\": \"e.heugly@utahslawyers.com\", \"rememberMe\": false}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36', '2026-11-16 11:08:25.185'),
('ccf7f548-cefc-4c31-87eb-cefc860237a4', '66c97d44-096b-4d34-8bd1-5691ba855e23', 'Eleanor Heugly, Esq.', 'super_admin', 'USER_LOGIN_SUCCESS', 'AUTH', '66c97d44-096b-4d34-8bd1-5691ba855e23', '{\"role\": \"super_admin\", \"email\": \"e.heugly@utahslawyers.com\", \"rememberMe\": false}', '::1', 'Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9711', '2026-11-16 10:22:09.556'),
('d1b66e91-2e7a-4007-aaaf-6e6a0227ac5d', '66c97d44-096b-4d34-8bd1-5691ba855e23', 'SYSTEM', 'super_admin', 'IOLTA_DEPOSIT_RECORDED', 'TRUST_ACCOUNTING', 'ca6def6e-f315-4c45-be85-4970f65a5afb', '{\"amount\": 1000, \"ledgerCode\": \"TRU-26-0001\", \"newBalance\": 1000, \"sourceReference\": \"Wire Transfer / Client Retainer\"}', '::ffff:100.64.0.6', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36', '2026-11-16 12:29:13.979'),
('d4c24f31-a0cc-4947-a181-3e5d3e1eb8d8', '66c97d44-096b-4d34-8bd1-5691ba855e23', 'Eleanor Heugly, Esq.', 'super_admin', 'USER_LOGIN_SUCCESS', 'AUTH', '66c97d44-096b-4d34-8bd1-5691ba855e23', '{\"role\": \"super_admin\", \"email\": \"e.heugly@utahslawyers.com\", \"rememberMe\": false}', '::ffff:100.64.0.9', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36', '2026-11-17 06:23:19.319'),
('d81aaf70-9a4e-4105-b625-1fc2deacf4de', '66c97d44-096b-4d34-8bd1-5691ba855e23', 'SYSTEM', 'super_admin', 'DOCUMENT_DRAFT_GENERATED', 'DOCUMENT_DRAFT', 'bf9322fc-da39-47bc-828e-a972610c9f05', '{\"draftCode\": \"DFT-26-0001\", \"isComplete\": true, \"matterNumber\": \"26-FAM-0101\", \"templateCode\": \"001\", \"missingFieldsCount\": 0}', '::ffff:100.64.0.20', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36', '2026-11-16 12:02:37.276'),
('d91fdf8c-67ff-4649-a36b-766df6bb30c3', '66c97d44-096b-4d34-8bd1-5691ba855e23', 'SYSTEM', 'super_admin', 'DOCUMENT_VERSION_UPLOADED', 'DOCUMENT', '62021eb8-345e-4522-9f4e-29df81aa37de', '{\"sha256\": \"26df269a364e96fdc072d4728ced32ca656c0b9c4204857086df7ecd933b51c1\", \"fileName\": \"ui-flow.pdf\", \"documentCode\": \"DOC-26-0001\", \"versionLabel\": \"v1.0\"}', '::ffff:100.64.0.12', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36', '2026-11-17 07:30:04.414'),
('e27d02ce-c136-44e8-a2bd-de4fe07d555a', '66c97d44-096b-4d34-8bd1-5691ba855e23', 'Eleanor Heugly, Esq.', 'super_admin', 'USER_LOGIN_SUCCESS', 'AUTH', '66c97d44-096b-4d34-8bd1-5691ba855e23', '{\"role\": \"super_admin\", \"email\": \"e.heugly@utahslawyers.com\", \"rememberMe\": false}', '::ffff:100.64.0.12', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36', '2026-11-17 05:05:02.307'),
('e4ac5415-bc16-4d3e-a68e-15c46396b563', '66c97d44-096b-4d34-8bd1-5691ba855e23', 'Eleanor Heugly, Esq.', 'super_admin', 'USER_LOGIN_SUCCESS', 'AUTH', '66c97d44-096b-4d34-8bd1-5691ba855e23', '{\"role\": \"super_admin\", \"email\": \"e.heugly@utahslawyers.com\", \"rememberMe\": false}', '::ffff:100.64.0.21', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36', '2026-11-20 06:04:03.513'),
('e6e4e2a2-2d40-42e9-b97c-6c654c3e7489', '66c97d44-096b-4d34-8bd1-5691ba855e23', 'e.heugly@utahslawyers.com', 'super_admin', 'USER_DEACTIVATED', 'USER', 'b4144e13-e1b8-4c10-bc62-3ca0966380e0', '{\"newStatus\": \"Inactive\", \"targetEmail\": \"r.adams@utahslawyers.com\", \"previousStatus\": \"Active\", \"targetUserCode\": \"USR-007\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36', '2026-11-16 11:59:06.075'),
('e8ad198c-d645-4de3-b592-93ad46e18c7e', '66c97d44-096b-4d34-8bd1-5691ba855e23', 'Eleanor Heugly, Esq.', 'super_admin', 'USER_LOGIN_SUCCESS', 'AUTH', '66c97d44-096b-4d34-8bd1-5691ba855e23', '{\"role\": \"super_admin\", \"email\": \"e.heugly@utahslawyers.com\", \"rememberMe\": false}', '::ffff:100.64.0.21', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36', '2026-11-17 05:29:05.093'),
('ec1c0628-494f-4b6d-a3b6-78aa8dd8061e', '66c97d44-096b-4d34-8bd1-5691ba855e23', 'Eleanor Heugly, Esq.', 'super_admin', 'USER_LOGIN_SUCCESS', 'AUTH', '66c97d44-096b-4d34-8bd1-5691ba855e23', '{\"role\": \"super_admin\", \"email\": \"e.heugly@utahslawyers.com\", \"rememberMe\": false}', '::ffff:100.64.0.4', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36', '2026-11-25 13:21:29.271'),
('f632b1a5-94ff-4de2-bcee-d5b9fba687ca', '66c97d44-096b-4d34-8bd1-5691ba855e23', 'SYSTEM', 'super_admin', 'TEMPLATE_STATUS_CHANGED', 'DOCUMENT_TEMPLATE', '47a69abb-1d3b-4d63-998b-49a7a632aa69', '{\"isActive\": false, \"templateCode\": \"112\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/158.0.0.0 Safari/537.36', '2026-11-25 09:08:16.120'),
('f88c6014-da3c-43a4-af31-0f10f4847507', '8640f71a-0142-42f4-a4c0-732537dcd9b7', 'Thomas Bludworth, Esq.', 'attorney', 'USER_LOGIN_SUCCESS', 'AUTH', '8640f71a-0142-42f4-a4c0-732537dcd9b7', '{\"role\": \"attorney\", \"email\": \"t.bludworth@utahslawyers.com\", \"rememberMe\": false}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36', '2026-11-16 12:07:09.940'),
('ff4bc5dc-9ea9-4165-82cd-9d5b2384f216', '66c97d44-096b-4d34-8bd1-5691ba855e23', 'Eleanor Heugly, Esq.', 'super_admin', 'USER_LOGIN_SUCCESS', 'AUTH', '66c97d44-096b-4d34-8bd1-5691ba855e23', '{\"role\": \"super_admin\", \"email\": \"e.heugly@utahslawyers.com\", \"rememberMe\": false}', '::ffff:100.64.0.12', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36', '2026-11-16 12:15:20.797');

-- --------------------------------------------------------

--
-- Table structure for table `bankruptcy_cases`
--

CREATE TABLE `bankruptcy_cases` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `matter_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `chapter` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `case_number` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `court_district` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT 'District of Utah',
  `court_division` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT 'Salt Lake City',
  `assigned_judge` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `trustee_name` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `debtor_type` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Individual',
  `filing_date` date DEFAULT NULL,
  `meeting_341_date` datetime(3) DEFAULT NULL,
  `confirmation_date` date DEFAULT NULL,
  `discharge_date` date DEFAULT NULL,
  `status` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Pre-Filing',
  `household_size` int DEFAULT '1',
  `monthly_gross_income` decimal(12,2) DEFAULT NULL,
  `means_test_status` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `total_secured_debt` decimal(12,2) DEFAULT '0.00',
  `total_unsecured_debt` decimal(12,2) DEFAULT '0.00',
  `total_priority_debt` decimal(12,2) DEFAULT '0.00',
  `total_assets` decimal(12,2) DEFAULT '0.00',
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `bankruptcy_creditors`
--

CREATE TABLE `bankruptcy_creditors` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `bankruptcy_case_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `creditor_name` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `claim_type` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `account_number` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `claim_amount` decimal(12,2) NOT NULL,
  `collateral_description` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `collateral_value` decimal(12,2) DEFAULT NULL,
  `address` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `city` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `state` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `zip` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_notice_only` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `bankruptcy_schedules`
--

CREATE TABLE `bankruptcy_schedules` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `bankruptcy_case_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `schedule_code` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `value_amount` decimal(12,2) NOT NULL,
  `exempt_amount` decimal(12,2) DEFAULT '0.00',
  `statutory_exemption_law` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `calendar_events`
--

CREATE TABLE `calendar_events` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `matter_id` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `event_type` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `start_time` datetime(3) NOT NULL,
  `end_time` datetime(3) NOT NULL,
  `location` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `judge` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_court_appearance` tinyint(1) NOT NULL DEFAULT '0',
  `created_by_user_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `chart_of_accounts`
--

CREATE TABLE `chart_of_accounts` (
  `account_number` int NOT NULL,
  `account_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `account_type` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `chart_of_accounts`
--

INSERT INTO `chart_of_accounts` (`account_number`, `account_name`, `account_type`, `is_active`) VALUES
(1010, 'Operating Cash Account', 'Asset', 1),
(1020, 'IOLTA Trust Bank Account', 'Asset', 1),
(1200, 'Accounts Receivable', 'Asset', 1),
(2100, 'Client Trust Liability (Escrow)', 'Liability', 1),
(4000, 'Legal Fee Revenue', 'Revenue', 1),
(5000, 'Operating Expenses', 'Expense', 1);

-- --------------------------------------------------------

--
-- Table structure for table `clients`
--

CREATE TABLE `clients` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `client_number` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `client_type` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `primary_contact` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `address` text COLLATE utf8mb4_unicode_ci,
  `assigned_attorney_id` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Active',
  `notes` text COLLATE utf8mb4_unicode_ci,
  `portal_access_enabled` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `clients`
--

INSERT INTO `clients` (`id`, `client_number`, `name`, `client_type`, `primary_contact`, `email`, `phone`, `address`, `assigned_attorney_id`, `status`, `notes`, `portal_access_enabled`, `created_at`, `updated_at`) VALUES
('b23414a1-b309-44c9-8097-bb3fc368222d', 'CLI-1001', 'david john', 'Organization', 'david', 'davide@gmail.com', '2344565632', NULL, '66c97d44-096b-4d34-8bd1-5691ba855e23', 'Active', 'Converted from Intake INT-26-0001. Adverse Parties screened: thomas', 0, '2026-11-16 11:15:26.266', '2026-11-16 11:15:26.266');

-- --------------------------------------------------------

--
-- Table structure for table `communications`
--

CREATE TABLE `communications` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `client_id` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `matter_id` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `type` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `subject` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `sender` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `recipient` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `summary` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `direction` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'OUTBOUND',
  `date` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `duration_minutes` int DEFAULT NULL,
  `status` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Filed',
  `source_identifier` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_by_id` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `conflict_search_logs`
--

CREATE TABLE `conflict_search_logs` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `intake_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `queried_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `matched_entity_type` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `matched_record_id` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `searched_by_user_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `searched_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `court_hearings`
--

CREATE TABLE `court_hearings` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `litigation_case_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `hearing_type` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `hearing_date` datetime(3) NOT NULL,
  `courtroom` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `judge_name` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Scheduled',
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `criminal_cases`
--

CREATE TABLE `criminal_cases` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `matter_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `defendant_name` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `court_jurisdiction` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `case_docket_number` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `presiding_judge` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `prosecuting_agency` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `bail_amount` decimal(12,2) DEFAULT '0.00',
  `custody_status` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Released on Bail',
  `arraignment_date` datetime(3) DEFAULT NULL,
  `preliminary_hearing_date` datetime(3) DEFAULT NULL,
  `trial_date` datetime(3) DEFAULT NULL,
  `status` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Arraignment Scheduled',
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `criminal_charges`
--

CREATE TABLE `criminal_charges` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `criminal_case_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `count_number` int NOT NULL,
  `statute_code` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `charge_title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `severity_class` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `plea` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT 'Not Guilty',
  `disposition` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `discovery_requests`
--

CREATE TABLE `discovery_requests` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `litigation_case_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `category` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `propounding_party` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `responding_party` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `served_date` date DEFAULT NULL,
  `due_date` date NOT NULL,
  `status` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Pending',
  `completed_date` date DEFAULT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `documents`
--

CREATE TABLE `documents` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `document_code` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `matter_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `client_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `category` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `current_version` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'v1.0',
  `is_privileged` tinyint(1) NOT NULL DEFAULT '0',
  `privilege_type` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ocr_content` longtext COLLATE utf8mb4_unicode_ci,
  `bates_number_start` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `bates_number_end` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `document_drafts`
--

CREATE TABLE `document_drafts` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `draft_code` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `matter_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `client_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `template_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `template_version_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Draft',
  `docx_storage_key` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `pdf_storage_key` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `missing_fields_flags` json NOT NULL,
  `generated_by_user_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `reviewed_by_user_id` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `reviewed_at` datetime(3) DEFAULT NULL,
  `has_manual_edits` tinyint(1) NOT NULL DEFAULT '0',
  `is_stale` tinyint(1) NOT NULL DEFAULT '0',
  `final_document_id` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL
) ;

--
-- Dumping data for table `document_drafts`
--

INSERT INTO `document_drafts` (`id`, `draft_code`, `matter_id`, `client_id`, `template_id`, `template_version_id`, `title`, `status`, `docx_storage_key`, `pdf_storage_key`, `missing_fields_flags`, `generated_by_user_id`, `reviewed_by_user_id`, `reviewed_at`, `has_manual_edits`, `is_stale`, `final_document_id`, `created_at`, `updated_at`) VALUES
('bf9322fc-da39-47bc-828e-a972610c9f05', 'DFT-26-0001', 'fdefc7e3-861c-4838-a38a-f580b6c59e8b', 'b23414a1-b309-44c9-8097-bb3fc368222d', '283a2dd2-2e77-4466-9919-dc0a1eb6226e', 'c4ec8be5-740c-4049-8d6c-d5e7b3c66983', 'Master Client Engagement & Retainer Agreement (Template 001) - david john v. thomas', 'Draft', 'drafts/fdefc7e3-861c-4838-a38a-f580b6c59e8b/DFT-26-0001.docx', NULL, '[]', '66c97d44-096b-4d34-8bd1-5691ba855e23', NULL, NULL, 0, 0, NULL, '2026-11-16 12:02:37.223', '2026-11-16 12:02:37.223');

-- --------------------------------------------------------

--
-- Table structure for table `document_field_mappings`
--

CREATE TABLE `document_field_mappings` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `template_version_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `placeholder_tag` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `source_entity` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `source_field` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_required` tinyint(1) NOT NULL DEFAULT '1',
  `default_value` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `formatting_rule` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `conditional_expression` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `document_field_mappings`
--

INSERT INTO `document_field_mappings` (`id`, `template_version_id`, `placeholder_tag`, `source_entity`, `source_field`, `is_required`, `default_value`, `formatting_rule`, `conditional_expression`, `created_at`, `updated_at`) VALUES
('0061b730-d0f4-461e-bc62-afd3143b4170', '0ad99ee2-841e-468d-98b1-a51f2e5b51ee', '{{Attorney.Name}}', 'ResponsibleAttorney', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:21:13.110', '2026-11-25 09:21:13.110'),
('006d220e-4a16-47cf-aeb4-1e0a09fff742', '8fe19204-74cd-40be-ae84-fbe2a03a3803', '{{Attorney.Name}}', 'ResponsibleAttorney', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:10:19.043', '2026-11-25 09:10:19.043'),
('009bf3d6-edf6-4854-9b9b-7c1bead07613', '27f17c2f-55ae-406c-8d5d-1cde5931934d', '{{Matter.MatterNumber}}', 'Matter', 'matterNumber', 1, NULL, 'NONE', NULL, '2026-11-25 09:31:06.958', '2026-11-25 09:31:06.958'),
('00d5eb74-17cf-4b3c-9adf-1deb54c8edb6', 'a25a6d17-8108-426c-84a8-84dddb0d4e14', '{{Attorney.Name}}', 'ResponsibleAttorney', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:18:08.122', '2026-11-25 09:18:08.122'),
('00f0478c-54b4-4542-8efd-4452c7bf378b', '23bb7516-3519-4d23-ba71-d470de1605e0', '{{Matter.Title}}', 'Matter', 'title', 1, NULL, 'NONE', NULL, '2026-11-25 09:42:15.911', '2026-11-25 09:42:15.911'),
('010a9f10-c33a-4891-8cce-000eb7e5d8ec', '2921473b-3172-4a76-9567-4533d18df0a9', '{{Client.Name}}', 'Client', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:18:33.651', '2026-11-25 09:18:33.651'),
('013f9386-3248-428d-8899-5e3d053b40cb', 'd25581db-9683-4af4-be68-eb539366297e', '{{Attorney.Name}}', 'ResponsibleAttorney', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:11:28.516', '2026-11-25 09:11:28.516'),
('0143dd40-3487-48c9-8d7a-5c1ef449d53d', '592f3f30-cc15-4dbf-8cbe-976516e0ea61', '{{Attorney.Name}}', 'ResponsibleAttorney', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:39:20.650', '2026-11-25 09:39:20.650'),
('014563c5-c10b-4aab-92fb-b40ef8ed4db8', 'd51ef237-53a6-4724-a58f-1620a49a6b25', '{{Insurance.CarrierName}}', 'Insurance', 'insuranceCompany', 0, NULL, 'NONE', NULL, '2026-11-25 09:20:40.792', '2026-11-25 09:20:40.792'),
('0154353f-c1b1-45d8-b5f1-2220eaf0f267', 'c2303872-a179-4c73-93f2-941c4abcbc6d', '{{Matter.Title}}', 'Matter', 'title', 1, NULL, 'NONE', NULL, '2026-11-25 09:24:55.871', '2026-11-25 09:24:55.871'),
('017b1c3c-6160-4b80-87ba-0b5907d30678', '38802e64-abb7-4888-9103-69a8af7f72da', '{{Matter.MatterNumber}}', 'Matter', 'matterNumber', 1, NULL, 'NONE', NULL, '2026-11-25 09:27:34.610', '2026-11-25 09:27:34.610'),
('017fac88-8f15-4e14-8c35-1743ccead2ea', '5c908fec-6fd2-4583-8543-7d9d3047abc0', '{{Matter.MatterNumber}}', 'Matter', 'matterNumber', 1, NULL, 'NONE', NULL, '2026-11-25 09:33:57.709', '2026-11-25 09:33:57.709'),
('01af4eec-58c3-4131-85d2-9a34bae6b31a', 'bfca17de-bbd6-4c08-92f0-3f99bfb54785', '{{Insurance.ClaimNumber}}', 'Insurance', 'claimNumber', 0, NULL, 'NONE', NULL, '2026-11-25 09:39:47.060', '2026-11-25 09:39:47.060'),
('01af6365-a027-43c0-8a37-5e337f9cc616', '53bc3d46-cfba-4978-aced-36898c7f25bd', '{{Client.Name}}', 'Client', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:33:30.964', '2026-11-25 09:33:30.964'),
('01b9702e-4a65-465a-8907-3a9240cf9dcf', '77fbb573-40db-43ef-b3f6-7856e2272e2e', '{{Matter.Title}}', 'Matter', 'title', 1, NULL, 'NONE', NULL, '2026-11-25 09:25:46.767', '2026-11-25 09:25:46.767'),
('01effcd8-2a12-46c4-ad51-a335139d9a33', 'd534334f-ffd5-4c0f-891f-4361aeabdccb', '{{Attorney.Name}}', 'ResponsibleAttorney', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:14:29.395', '2026-11-25 09:14:29.395'),
('02778068-0a57-45a7-907b-db2024272b47', 'c59cf2fd-2725-4f2d-ad2c-f2023addff3e', '{{Client.Name}}', 'Client', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:43:34.906', '2026-11-25 09:43:34.906'),
('027bf5d6-52fb-42c5-b439-4dfa067ece3b', 'f6f0f444-c32f-4188-943b-0ba2dcb10cd4', '{{Matter.MatterNumber}}', 'Matter', 'matterNumber', 1, NULL, 'NONE', NULL, '2026-11-25 09:34:04.500', '2026-11-25 09:34:04.500'),
('02b73db1-6448-4db7-b22a-17f9a6a6c7c6', 'fb67f315-9816-4b39-a52a-f04d70347eb8', '{{Attorney.Name}}', 'ResponsibleAttorney', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:42:30.175', '2026-11-25 09:42:30.175'),
('03365185-95f3-475f-8127-73538f582363', 'a1ae9879-d795-4d25-b0fc-2536ccb1031e', '{{Matter.Title}}', 'Matter', 'title', 1, NULL, 'NONE', NULL, '2026-11-25 09:12:38.790', '2026-11-25 09:12:38.790'),
('036f438b-3507-410e-a13d-2761f82d6b68', '7e69c06a-139d-48d6-af7c-bbbc8ff7cf3f', '{{Client.Name}}', 'Client', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:45:17.740', '2026-11-25 09:45:17.740'),
('03f6f0b2-f79c-43d3-8dbf-5b4d2e123527', '042435a0-f2fb-4811-891e-e9feb57900f1', '{{Attorney.Name}}', 'ResponsibleAttorney', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:25:28.318', '2026-11-25 09:25:28.318'),
('0403a79b-f6b9-46fd-a2b4-ae57e8ad645c', 'c817370e-6a7c-4971-9a06-d1d243a3249e', '{{Attorney.Name}}', 'ResponsibleAttorney', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:17:41.650', '2026-11-25 09:17:41.650'),
('0423435b-5040-45a7-8ecd-76f7693c3964', '852400e2-7592-4ca8-a194-fbc1bf456fb1', '{{Matter.Title}}', 'Matter', 'title', 1, NULL, 'NONE', NULL, '2026-11-25 09:42:52.489', '2026-11-25 09:42:52.489'),
('042c747f-6be8-4d6c-b589-508b148ce04f', '512ed74f-1f59-4a55-bbb2-348dc6dc277e', '{{Matter.MatterNumber}}', 'Matter', 'matterNumber', 1, NULL, 'NONE', NULL, '2026-11-25 09:22:59.548', '2026-11-25 09:22:59.548'),
('042d3de9-cef3-4b1d-8aa2-b75eb7ab3723', '06b41a84-824b-4759-b3f2-d49f9828dd05', '{{CurrentDate.Long}}', 'CurrentDate', 'long', 0, NULL, 'NONE', NULL, '2026-11-25 09:37:02.335', '2026-11-25 09:37:02.335'),
('044e82cf-0264-424a-a0d2-a14f2728553e', '34590700-cfd8-4fe4-bbd5-8519dee10003', '{{Matter.Title}}', 'Matter', 'title', 1, NULL, 'NONE', NULL, '2026-11-25 09:37:15.408', '2026-11-25 09:37:15.408'),
('045886e5-1e27-424d-8db0-44b288480b14', '05d6bd45-cbbf-4e86-852e-fac15162a534', '{{Matter.MatterNumber}}', 'Matter', 'matterNumber', 1, NULL, 'NONE', NULL, '2026-11-25 09:42:45.141', '2026-11-25 09:42:45.141'),
('0509550d-baa3-4e62-8a8b-0e74e9f844c2', '4a8557bf-69eb-447c-b559-e45c3ee6584d', '{{Matter.Title}}', 'Matter', 'title', 1, NULL, 'NONE', NULL, '2026-11-25 09:43:19.390', '2026-11-25 09:43:19.390'),
('05509692-fc56-4163-b0be-6c38e8ec8d6d', 'd7c3f728-e7aa-4abb-82e1-b77e855808b2', '{{Client.Name}}', 'Client', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:36:33.810', '2026-11-25 09:36:33.810'),
('0553c9a8-f62d-420d-b5ae-cc10a6b3b37b', '3518a797-b578-4ecf-90f0-c21e436d54ed', '{{Client.Name}}', 'Client', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:16:53.697', '2026-11-25 09:16:53.697'),
('05710aaf-3060-424a-9fe9-a93297944b20', 'e156defb-48fa-424a-9036-9fbb2c624c41', '{{Client.Name}}', 'Client', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:23:43.289', '2026-11-25 09:23:43.289'),
('05875271-07a5-4ebe-b3a2-5ff757427db4', 'e157fff3-b830-4744-a7ea-4f78cc3f88ee', '{{Matter.MatterNumber}}', 'Matter', 'matterNumber', 1, NULL, 'NONE', NULL, '2026-11-25 09:17:33.084', '2026-11-25 09:17:33.084'),
('05986171-8275-4dc9-be0b-e089f2a0aa16', 'd51ef237-53a6-4724-a58f-1620a49a6b25', '{{Client.Name}}', 'Client', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:20:40.792', '2026-11-25 09:20:40.792'),
('05a12f1e-ac8b-434a-a025-f0bc82fa615a', '7c065d2e-46e5-4be9-8aca-231b61f602ae', '{{Matter.Title}}', 'Matter', 'title', 1, NULL, 'NONE', NULL, '2026-11-25 09:18:27.169', '2026-11-25 09:18:27.169'),
('05bc87c3-b8a1-46c7-b3c7-1fc76df96e88', '852400e2-7592-4ca8-a194-fbc1bf456fb1', '{{Attorney.Name}}', 'ResponsibleAttorney', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:42:52.489', '2026-11-25 09:42:52.489'),
('05e1b6d3-523c-4151-9a94-a381662f6e23', '1a8791a0-7c79-45e1-a55a-0300de688341', '{{Client.Name}}', 'Client', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:25:58.891', '2026-11-25 09:25:58.891'),
('05e73ed0-beeb-44c3-90ca-89f1a72f1396', '6f4e7b2b-9b59-419e-9e16-9a91ef17a6ad', '{{Matter.Title}}', 'Matter', 'title', 1, NULL, 'NONE', NULL, '2026-11-25 09:35:44.995', '2026-11-25 09:35:44.995'),
('05e9f740-4c58-4ac3-9505-5b8880f4a550', 'dd990efc-d55c-4258-9f99-222b61fea6f9', '{{CurrentDate.Long}}', 'CurrentDate', 'long', 0, NULL, 'NONE', NULL, '2026-11-25 09:10:27.131', '2026-11-25 09:10:27.131'),
('05f5d3e5-f062-4f1b-bd00-555a4b04076c', 'e7250e39-5976-4061-9be3-c776a91a40d3', '{{Attorney.Name}}', 'ResponsibleAttorney', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:27:08.713', '2026-11-25 09:27:08.713'),
('061dd0fd-37e9-4ec9-bff8-def4588895db', 'b0f8af6b-e459-46d0-849b-c7d88fc13633', '{{Matter.Title}}', 'Matter', 'title', 1, NULL, 'NONE', NULL, '2026-11-25 09:24:45.504', '2026-11-25 09:24:45.504'),
('063d72e8-bb93-49eb-a24c-53720c26736f', 'e69186ac-46bc-4fea-82bf-e9bd834342ac', '{{Client.Name}}', 'Client', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:15:11.521', '2026-11-25 09:15:11.521'),
('064a00db-037e-46a2-99a2-673ee4b1ebe7', '1bcd8d6e-d341-40f2-a658-171ab595c104', '{{Matter.MatterNumber}}', 'Matter', 'matterNumber', 1, NULL, 'NONE', NULL, '2026-11-25 09:42:38.075', '2026-11-25 09:42:38.075'),
('06586943-2f9a-4905-8d4e-4adaf5b53026', '2c0605e3-233d-47b9-b595-5dc7dedf36a1', '{{Matter.MatterNumber}}', 'Matter', 'matterNumber', 1, NULL, 'NONE', NULL, '2026-11-25 09:39:01.771', '2026-11-25 09:39:01.771'),
('0694d1f5-ee17-4923-9415-21614ae5ee61', '85a9dc73-04a9-429c-bea2-9b6c30b6f1b8', '{{Attorney.Name}}', 'ResponsibleAttorney', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:16:06.548', '2026-11-25 09:16:06.548'),
('06c0680e-b077-4596-b8c8-b1d96aadc4b4', '94cd0be6-7b2b-46b8-bf0c-2afb31db795c', '{{Attorney.Name}}', 'ResponsibleAttorney', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:17:06.680', '2026-11-25 09:17:06.680'),
('06de2c8a-787a-435e-8bcc-e10e610bc87e', '7c065d2e-46e5-4be9-8aca-231b61f602ae', '{{Client.Name}}', 'Client', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:18:27.169', '2026-11-25 09:18:27.169'),
('071983be-621f-4949-8272-a69edc21eff7', '229186e0-fd2e-47f1-8232-6cb06d441d40', '{{Matter.Title}}', 'Matter', 'title', 1, NULL, 'NONE', NULL, '2026-11-25 09:26:52.668', '2026-11-25 09:26:52.668'),
('07555108-d546-4df4-994a-aab96d9e7062', '8eaaf587-a871-4b9d-ba8a-54e4e38e7234', '{{Matter.MatterNumber}}', 'Matter', 'matterNumber', 1, NULL, 'NONE', NULL, '2026-11-25 09:41:15.701', '2026-11-25 09:41:15.701'),
('07564aff-e0ea-4c3c-bb56-61def61034b0', '743bda6c-ef38-42c4-9876-5bb952ba909e', '{{Matter.MatterNumber}}', 'Matter', 'matterNumber', 1, NULL, 'NONE', NULL, '2026-11-25 09:37:40.653', '2026-11-25 09:37:40.653'),
('07b36200-6c39-493d-8446-370b4e73c378', '5a981617-df0e-4bdb-82f9-9d15d3011053', '{{Attorney.Name}}', 'ResponsibleAttorney', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:42:08.360', '2026-11-25 09:42:08.360'),
('07f29020-b0ec-4277-9f5b-7f9b394e9c63', '4f9a81a9-9252-4774-9e0a-dd01e6c80ac9', '{{Client.Name}}', 'Client', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:11:54.187', '2026-11-25 09:11:54.187'),
('0811c2a1-a04a-40d0-b573-31600ae7ff42', '624c4276-dd94-475c-b02b-8aadc8109363', '{{Matter.Title}}', 'Matter', 'title', 1, NULL, 'NONE', NULL, '2026-11-25 09:27:54.188', '2026-11-25 09:27:54.188'),
('0848d110-4d97-41a1-983b-9106cd8b010d', 'fd5a203a-5e69-48fa-b56e-5f807c102f1f', '{{Client.Name}}', 'Client', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:22:11.842', '2026-11-25 09:22:11.842'),
('086ef64a-a816-4309-a06e-08bd42af90a7', 'e7250e39-5976-4061-9be3-c776a91a40d3', '{{Matter.MatterNumber}}', 'Matter', 'matterNumber', 1, NULL, 'NONE', NULL, '2026-11-25 09:27:08.713', '2026-11-25 09:27:08.713'),
('087e1e4b-822d-4424-abce-c206afe0fcab', '9361319b-c01b-4fd1-93fe-140cea9a86b6', '{{Client.Name}}', 'Client', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:41:02.182', '2026-11-25 09:41:02.182'),
('08882b24-2f95-41a7-9f7f-e7b389fb5d88', '743bda6c-ef38-42c4-9876-5bb952ba909e', '{{Attorney.Name}}', 'ResponsibleAttorney', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:37:40.653', '2026-11-25 09:37:40.653'),
('08ec6f78-fbdc-49e9-87c0-4c678bf3631e', 'ef522887-592a-4660-91a0-efe24715406f', '{{Attorney.Name}}', 'ResponsibleAttorney', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:09:43.379', '2026-11-25 09:09:43.379'),
('094f368a-9299-4500-8f67-5b7c6b912aa1', '63f83669-73d7-4103-8985-2988d5f0bd36', '{{Attorney.Name}}', 'ResponsibleAttorney', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:28:47.493', '2026-11-25 09:28:47.493'),
('09841627-eb34-40c4-869a-df01a694f0a2', '1268ae6d-8b19-4bfa-876e-155d51e429c9', '{{Client.Name}}', 'Client', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:10:58.045', '2026-11-25 09:10:58.045'),
('09925d4e-74d4-4e15-b806-92717fe29ada', 'd51ef237-53a6-4724-a58f-1620a49a6b25', '{{Incident.AccidentDate}}', 'Incident', 'accidentDate', 0, NULL, 'DATE_LONG', NULL, '2026-11-25 09:20:40.792', '2026-11-25 09:20:40.792'),
('09b07511-2e1a-4721-823b-d780357727e2', 'c69600cd-b146-4522-aa83-5b71a475f133', '{{Client.Name}}', 'Client', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:25:03.045', '2026-11-25 09:25:03.045'),
('09df0901-afde-4f6d-9dd5-3ec49a3d5910', '3d32beda-4c29-4858-a945-a78c68a9eb1c', '{{Attorney.Name}}', 'ResponsibleAttorney', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:19:04.418', '2026-11-25 09:19:04.418'),
('0a1a7716-1ec5-4fec-a688-623aadfa87b6', '46f31fd0-867e-4edf-bacc-1923e699b8ac', '{{Client.Name}}', 'Client', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:10:46.357', '2026-11-25 09:10:46.357'),
('0a464a29-c538-4091-a141-7193c4272d4c', '5ba7f4b1-3bfe-41f2-b66a-9d4d563937e2', '{{Attorney.Name}}', 'ResponsibleAttorney', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:29:43.089', '2026-11-25 09:29:43.089'),
('0a46a590-6211-4fe9-9467-eaca54d07177', '229186e0-fd2e-47f1-8232-6cb06d441d40', '{{Matter.MatterNumber}}', 'Matter', 'matterNumber', 1, NULL, 'NONE', NULL, '2026-11-25 09:26:52.668', '2026-11-25 09:26:52.668'),
('0a602223-46b9-4a6b-8cab-f84494e29a4c', '3e010dc9-fa85-4ad9-8a07-540f5b72d1ea', '{{Matter.Title}}', 'Matter', 'title', 1, NULL, 'NONE', NULL, '2026-11-25 09:44:14.592', '2026-11-25 09:44:14.592'),
('0a9275ec-4717-48fa-943a-83ea85cf9d30', '9c67f9f1-d35c-4140-aa89-9d63475911cb', '{{Client.Name}}', 'Client', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:37:47.374', '2026-11-25 09:37:47.374'),
('0ac658d0-7249-4c0f-804e-816766a7f080', '2aaef701-5ea8-42cc-b381-3aad1aaac0e3', '{{Matter.MatterNumber}}', 'Matter', 'matterNumber', 1, NULL, 'NONE', NULL, '2026-11-25 09:11:16.455', '2026-11-25 09:11:16.455'),
('0b3cbd38-cd55-4232-9f81-f45107de096b', '5c908fec-6fd2-4583-8543-7d9d3047abc0', '{{Matter.Title}}', 'Matter', 'title', 1, NULL, 'NONE', NULL, '2026-11-25 09:33:57.709', '2026-11-25 09:33:57.709'),
('0b713707-9f69-4256-b52f-eaf436333e36', '613a6b40-e687-4fef-b6fb-073e8e3bf25a', '{{Matter.Title}}', 'Matter', 'title', 1, NULL, 'NONE', NULL, '2026-11-25 09:38:08.829', '2026-11-25 09:38:08.829'),
('0b7eab00-9b0e-4639-ac5e-76418173a859', '30de11a9-0130-4ce3-a0a4-0c8dd83ffc8b', '{{Matter.MatterNumber}}', 'Matter', 'matterNumber', 1, NULL, 'NONE', NULL, '2026-11-25 09:36:14.287', '2026-11-25 09:36:14.287'),
('0ba2b892-6b35-4e83-94ff-ec2eda785b6e', 'f57ee915-26c8-4404-b8af-6a03e2a7cb59', '{{Court.Name}}', 'Court', 'name', 0, NULL, 'NONE', NULL, '2026-11-25 09:40:41.743', '2026-11-25 09:40:41.743'),
('0c0d9ea8-b49b-4214-9a21-67af61ce9d8f', 'abc8d0dd-9195-4d6d-a0b6-0813f8842c54', '{{Attorney.Name}}', 'ResponsibleAttorney', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:34:10.516', '2026-11-25 09:34:10.516'),
('0c68c1e0-68c0-4f9e-888f-3deb07cccb57', '531fb454-bd9a-4435-b96c-e5589881e3cf', '{{Matter.MatterNumber}}', 'Matter', 'matterNumber', 1, NULL, 'NONE', NULL, '2026-11-25 09:31:18.939', '2026-11-25 09:31:18.939'),
('0ca8b53b-24b3-473c-8006-d48d8c444078', 'a2db730d-4dbc-4106-919b-fc0360d36f16', '{{Client.Name}}', 'Client', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:17:25.046', '2026-11-25 09:17:25.046'),
('0cd09267-aa9e-47df-a5e0-69333ac5d6fb', '114c5862-b73f-48ee-a72c-615ed35537b3', '{{MedicalProvider.Name}}', 'MedicalProvider', 'name', 0, NULL, 'NONE', NULL, '2026-11-25 09:24:04.682', '2026-11-25 09:24:04.682'),
('0d612f97-deb2-4b3b-8961-eb500f8fecae', 'a67d6b40-ebe4-4ea6-8415-365ae7961f61', '{{Matter.Title}}', 'Matter', 'title', 1, NULL, 'NONE', NULL, '2026-11-25 09:44:55.857', '2026-11-25 09:44:55.857'),
('0da78681-af19-46de-bc87-2efed1b36ed5', '531fb454-bd9a-4435-b96c-e5589881e3cf', '{{Attorney.Name}}', 'ResponsibleAttorney', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:31:18.939', '2026-11-25 09:31:18.939'),
('0dd78474-44c0-4263-8f0b-d03bd3cbe12c', '89bfc8b5-afc6-4a24-a9fd-f558824dc2c7', '{{Attorney.Name}}', 'ResponsibleAttorney', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:38:43.357', '2026-11-25 09:38:43.357'),
('0debf7c5-cbc9-4e2f-96b5-45e9229e2e20', 'cca756c1-e79e-4d0f-9f90-2b03eac1cbe1', '{{Attorney.Name}}', 'ResponsibleAttorney', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:13:05.421', '2026-11-25 09:13:05.421'),
('0dfcbda9-5875-4c00-b511-1b6ecf88ecbe', '55e6d123-74ea-443a-8bee-7a7913b1b687', '{{Matter.MatterNumber}}', 'Matter', 'matterNumber', 1, NULL, 'NONE', NULL, '2026-11-25 09:37:08.500', '2026-11-25 09:37:08.500'),
('0e2fbcdf-9d44-4ba1-9c87-321d8efc5a53', 'ec1c0e31-fed1-4081-9ec7-c1588deef41e', '{{Client.Name}}', 'Client', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:35:52.189', '2026-11-25 09:35:52.189'),
('0e3b2128-ae04-4a18-a3ce-81cc08bd87a9', '042435a0-f2fb-4811-891e-e9feb57900f1', '{{Matter.MatterNumber}}', 'Matter', 'matterNumber', 1, NULL, 'NONE', NULL, '2026-11-25 09:25:28.318', '2026-11-25 09:25:28.318'),
('0e5bc01a-0ce3-4d0e-a342-cb759d048515', 'eb02f6e2-eb95-476b-9f3a-0012c5e69de4', '{{Attorney.Name}}', 'ResponsibleAttorney', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:37:55.738', '2026-11-25 09:37:55.738'),
('0e673314-0b85-4f96-920e-26cf0ac3e853', '1a8791a0-7c79-45e1-a55a-0300de688341', '{{Attorney.Name}}', 'ResponsibleAttorney', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:25:58.891', '2026-11-25 09:25:58.891'),
('0e704148-f849-4435-9f0c-b420ed5fedb9', '04d4f9e6-5cb9-430c-9102-a9532ca61256', '{{Matter.Title}}', 'Matter', 'title', 1, NULL, 'NONE', NULL, '2026-11-25 09:27:59.859', '2026-11-25 09:27:59.859'),
('0e7eec75-3fab-47c2-85bd-e48b1a5b9d8f', 'c968ff58-b7bc-4390-a9ce-e07e8f62d618', '{{Attorney.Name}}', 'ResponsibleAttorney', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:28:41.155', '2026-11-25 09:28:41.155'),
('0e8cc372-df40-4e3a-938c-820903ad143c', '1c97c77a-8d55-4921-b569-90482c80ddac', '{{Matter.MatterNumber}}', 'Matter', 'matterNumber', 1, NULL, 'NONE', NULL, '2026-11-25 09:27:41.448', '2026-11-25 09:27:41.448'),
('0ecb359b-d0a7-4d05-99e9-a5e04468dc99', '241fd3a3-0135-4a8b-a617-c23cdff79820', '{{Matter.MatterNumber}}', 'Matter', 'matterNumber', 1, NULL, 'NONE', NULL, '2026-11-25 09:33:50.854', '2026-11-25 09:33:50.854'),
('0f37bc6e-86c2-4af0-a89c-ce2d0f0ff70f', 'eb6ab9da-aa7c-44b0-93d2-47e002eefd78', '{{Matter.MatterNumber}}', 'Matter', 'matterNumber', 1, NULL, 'NONE', NULL, '2026-11-25 09:21:31.807', '2026-11-25 09:21:31.807'),
('0fa871cc-3b61-48e0-9fa4-d016de1e07ec', '8a427a6e-d37a-4951-8cd6-24e4ed518b16', '{{Matter.MatterNumber}}', 'Matter', 'matterNumber', 1, NULL, 'NONE', NULL, '2026-11-25 09:29:00.511', '2026-11-25 09:29:00.511'),
('0fdda011-8706-4970-bace-2177facde4d8', 'd6d12dd8-f5fc-4ea7-947f-a57f919d757f', '{{Matter.Title}}', 'Matter', 'title', 1, NULL, 'NONE', NULL, '2026-11-25 09:17:16.922', '2026-11-25 09:17:16.922'),
('10213421-f0c7-4a0d-a2ef-f172baf5c37f', 'd6d12dd8-f5fc-4ea7-947f-a57f919d757f', '{{Attorney.Name}}', 'ResponsibleAttorney', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:17:16.922', '2026-11-25 09:17:16.922'),
('10361d4d-1fd6-4fdc-897b-6618f5cb9df8', '8f2d0739-761d-4c01-ade2-bfdd100e7001', '{{Client.Name}}', 'Client', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:23:37.028', '2026-11-25 09:23:37.028'),
('10899334-1af7-4265-8305-5765d8ca1c09', 'f6f0f444-c32f-4188-943b-0ba2dcb10cd4', '{{Attorney.Name}}', 'ResponsibleAttorney', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:34:04.500', '2026-11-25 09:34:04.500'),
('10f2a1ef-50fd-4a84-b1fc-9f5aa4e35a6e', '5a981617-df0e-4bdb-82f9-9d15d3011053', '{{Matter.Title}}', 'Matter', 'title', 1, NULL, 'NONE', NULL, '2026-11-25 09:42:08.360', '2026-11-25 09:42:08.360'),
('113e5871-d8a1-4eeb-acc8-c162196ef942', '5f1bd215-9ae3-4d54-abcb-1e3ee92b3623', '{{Client.Name}}', 'Client', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:39:28.396', '2026-11-25 09:39:28.396'),
('1149dfea-0377-441a-81b8-27b22a148c8e', 'a67d6b40-ebe4-4ea6-8415-365ae7961f61', '{{Client.Name}}', 'Client', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:44:55.857', '2026-11-25 09:44:55.857'),
('115fcfdb-bacc-45d6-b44e-9f3df4edaf70', '228a46fa-e493-4eed-8057-2350df11cfba', 'Client.Phone', 'Client', 'phone', 0, NULL, 'NONE', NULL, '2026-11-14 09:29:49.029', '2026-11-14 09:29:49.029'),
('11c39335-b94f-4e19-b7ac-cacba9e8fbcc', 'e156defb-48fa-424a-9036-9fbb2c624c41', '{{CurrentDate.Long}}', 'CurrentDate', 'long', 0, NULL, 'NONE', NULL, '2026-11-25 09:23:43.289', '2026-11-25 09:23:43.289'),
('11e1adf9-337a-4cec-b867-217a81e0b184', '06b41a84-824b-4759-b3f2-d49f9828dd05', '{{Attorney.Name}}', 'ResponsibleAttorney', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:37:02.335', '2026-11-25 09:37:02.335'),
('11f85982-de27-4ecc-9065-1b4c0ecf2533', 'f512924e-1ce1-4f7c-8a32-1b102bed96b8', '{{Attorney.Name}}', 'ResponsibleAttorney', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:21:39.574', '2026-11-25 09:21:39.574'),
('120b5f3b-f35b-4c7d-9f39-fa1962227acb', '65587343-3be5-4fb8-949e-9ec79b5633e9', '{{Attorney.Name}}', 'ResponsibleAttorney', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:30:59.762', '2026-11-25 09:30:59.762'),
('123c0d34-21f0-46bd-b885-76308119a2f9', '58ec5cad-437f-4a3c-8985-2768faed1166', '{{Attorney.Name}}', 'ResponsibleAttorney', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:34:59.842', '2026-11-25 09:34:59.842'),
('1265c85c-2778-4a28-b9b0-d153ef02fb65', '192fa43c-6472-473c-a04b-d0e469bd25c8', '{{Matter.Title}}', 'Matter', 'title', 1, NULL, 'NONE', NULL, '2026-11-25 09:38:15.749', '2026-11-25 09:38:15.749'),
('126b1e4b-207d-4a5b-a040-c0cf48cbf5c0', '531fb454-bd9a-4435-b96c-e5589881e3cf', '{{Client.Name}}', 'Client', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:31:18.939', '2026-11-25 09:31:18.939'),
('12cd623f-8820-4160-8df8-7ddcaee5295a', 'd554bfda-8bce-4121-a8fa-a94f5da56ba5', 'Attorney.Name', 'Attorney', 'name', 1, NULL, 'NONE', NULL, '2026-11-14 09:29:36.759', '2026-11-14 09:29:36.759'),
('12f87191-4034-4449-8141-2cf07c7a6031', 'c2303872-a179-4c73-93f2-941c4abcbc6d', '{{Matter.MatterNumber}}', 'Matter', 'matterNumber', 1, NULL, 'NONE', NULL, '2026-11-25 09:24:55.871', '2026-11-25 09:24:55.871'),
('1307f0ef-97e0-4df6-8ca6-2f46eb1a9b92', '4a08e886-9403-4d5f-8cf6-8666d9bad508', '{{Matter.Title}}', 'Matter', 'title', 1, NULL, 'NONE', NULL, '2026-11-25 09:39:55.755', '2026-11-25 09:39:55.755'),
('13394902-29c9-45d5-a493-2c47477674b5', '05e48612-750f-40cb-b0e5-13058702e7aa', '{{Client.Name}}', 'Client', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:08:12.860', '2026-11-25 09:08:12.860'),
('134fb5ea-3406-4ca1-91e3-7678f2f400e3', 'b74dc6ca-81f6-4b63-8298-1ef27989924a', '{{Attorney.Name}}', 'ResponsibleAttorney', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:40:28.195', '2026-11-25 09:40:28.195'),
('13551dd6-32ff-4160-b5be-2f6655f28e82', 'aae04ae9-b293-4539-a12a-781f0d71b8d1', '{{Court.Name}}', 'Court', 'name', 0, NULL, 'NONE', NULL, '2026-11-25 09:13:38.494', '2026-11-25 09:13:38.494'),
('137d9502-6a2b-439d-8ac9-94c1ea7cba2c', '55e6d123-74ea-443a-8bee-7a7913b1b687', '{{Attorney.Name}}', 'ResponsibleAttorney', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:37:08.500', '2026-11-25 09:37:08.500'),
('1383b3f3-7d85-4a90-b92a-041fafbad7e4', '89b37ce7-9d86-4a99-883a-8c5506774e9a', '{{Matter.MatterNumber}}', 'Matter', 'matterNumber', 1, NULL, 'NONE', NULL, '2026-11-25 09:19:44.491', '2026-11-25 09:19:44.491'),
('13c043f7-103e-4383-9634-a083d6b32745', '55c75bd5-de4c-42aa-8bef-cc597dec5070', '{{Attorney.Name}}', 'ResponsibleAttorney', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:40:56.254', '2026-11-25 09:40:56.254'),
('13c3e077-9c45-4a97-a865-e51bb3a11117', '7f58167b-7eb3-464f-8b2e-1555bb0b09f6', '{{Matter.MatterNumber}}', 'Matter', 'matterNumber', 1, NULL, 'NONE', NULL, '2026-11-25 09:28:06.109', '2026-11-25 09:28:06.109'),
('13fd0550-c586-42ba-bfbd-d8a6afdaa2e9', '3d18b45d-4569-4168-be21-a212ad7882bf', '{{Client.Name}}', 'Client', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:36:27.490', '2026-11-25 09:36:27.490'),
('1451763b-6039-40f0-bf00-5bcfadc6774e', '82f334d4-a724-4cf7-834d-e7ffeb29d708', '{{Court.Name}}', 'Court', 'name', 0, NULL, 'NONE', NULL, '2026-11-25 09:43:26.986', '2026-11-25 09:43:26.986'),
('14972ead-57fa-463e-9187-a97b887c8fa7', 'f55f9f4b-1665-4b30-acba-b249d2a03da2', '{{CurrentDate.Long}}', 'CurrentDate', 'long', 0, NULL, 'NONE', NULL, '2026-11-25 09:44:42.548', '2026-11-25 09:44:42.548'),
('14a530e7-0a48-43dc-9cc4-a68770cd7c66', 'cca756c1-e79e-4d0f-9f90-2b03eac1cbe1', '{{Matter.MatterNumber}}', 'Matter', 'matterNumber', 1, NULL, 'NONE', NULL, '2026-11-25 09:13:05.421', '2026-11-25 09:13:05.421'),
('14e6cde3-0ffb-4482-9d41-053814e02cc0', 'be52925f-f870-4293-bad1-7e3aa928d9b8', '{{Matter.Title}}', 'Matter', 'title', 1, NULL, 'NONE', NULL, '2026-11-25 09:14:36.880', '2026-11-25 09:14:36.880'),
('14fd7083-eb61-43fe-8fd7-31b15ad1fed9', '6e739347-97f7-4a33-b95c-78043f9aed05', '{{Matter.Title}}', 'Matter', 'title', 1, NULL, 'NONE', NULL, '2026-11-25 09:19:52.633', '2026-11-25 09:19:52.633'),
('15348c35-9a69-48c1-ab39-d6be3dfb3db6', '0527cd62-fdb7-4653-b0db-0199b267563c', '{{Client.Name}}', 'Client', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:22:44.662', '2026-11-25 09:22:44.662'),
('1554f276-4251-486d-a564-299518edce8c', '956862a8-e05a-49d7-a431-f8d353503fb7', '{{Matter.Title}}', 'Matter', 'title', 1, NULL, 'NONE', NULL, '2026-11-25 09:26:29.801', '2026-11-25 09:26:29.801'),
('156873ce-7a16-444e-8adc-8346d6ea980e', 'c1df0c28-85dc-454d-a4b5-8cfa6b73fdae', '{{Attorney.Name}}', 'ResponsibleAttorney', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:39:35.618', '2026-11-25 09:39:35.618'),
('15865a07-d7f9-44c3-9e35-87e9111fffc5', 'cc5d287b-035c-4bbb-8ad8-7cc0051ffb46', '{{Matter.MatterNumber}}', 'Matter', 'matterNumber', 1, NULL, 'NONE', NULL, '2026-11-25 09:30:52.249', '2026-11-25 09:30:52.249'),
('15b5742b-ace5-46dd-8d13-801183c4ffed', '3cdd654e-d99e-42e9-a77a-8687e4163a1f', '{{Client.Name}}', 'Client', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:11:47.534', '2026-11-25 09:11:47.534'),
('15b82b92-e644-483e-a08e-e80612f1682c', '743bda6c-ef38-42c4-9876-5bb952ba909e', '{{Client.Name}}', 'Client', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:37:40.653', '2026-11-25 09:37:40.653'),
('15b88f09-4f88-4c8f-9eaa-6a3a3d462fb9', 'c4ec8be5-740c-4049-8d6c-d5e7b3c66983', 'Attorney.Name', 'Attorney', 'name', 1, NULL, 'NONE', NULL, '2026-11-14 09:29:59.262', '2026-11-14 09:29:59.262'),
('15e812d0-62c5-43b3-8161-d1359fdfb5b6', '88dbdb77-3188-4699-801b-9f4553338ebf', '{{Matter.Title}}', 'Matter', 'title', 1, NULL, 'NONE', NULL, '2026-11-25 09:31:41.857', '2026-11-25 09:31:41.857'),
('163dce74-f50f-4c33-aee5-a88663231649', '1ae6da1a-7516-477c-9e1b-7ffeafd1bcb6', '{{Matter.MatterNumber}}', 'Matter', 'matterNumber', 1, NULL, 'NONE', NULL, '2026-11-25 09:27:47.278', '2026-11-25 09:27:47.278'),
('16f2fc36-6170-40a7-b591-6add3234da46', 'c436f021-cecd-4c60-9cba-9fc95cea429c', '{{Matter.MatterNumber}}', 'Matter', 'matterNumber', 1, NULL, 'NONE', NULL, '2026-11-25 09:34:36.019', '2026-11-25 09:34:36.019'),
('17321fed-8c73-457f-85ec-e67a1137d448', '3d32beda-4c29-4858-a945-a78c68a9eb1c', '{{Matter.Title}}', 'Matter', 'title', 1, NULL, 'NONE', NULL, '2026-11-25 09:19:04.418', '2026-11-25 09:19:04.418'),
('1743f969-19f4-4510-8ca3-5be0d4b92076', 'abc8d0dd-9195-4d6d-a0b6-0813f8842c54', '{{Matter.Title}}', 'Matter', 'title', 1, NULL, 'NONE', NULL, '2026-11-25 09:34:10.516', '2026-11-25 09:34:10.516'),
('17679511-dcaf-488c-971e-a201ce9ee4dd', '50a5e530-ac91-4503-a883-e3f98ebcb26a', '{{Client.Name}}', 'Client', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:16:46.597', '2026-11-25 09:16:46.597'),
('179930e1-f046-48da-b7a5-ead8c9f0df98', 'e7b63652-7194-4fd0-923c-6e5cc1cc7975', '{{Attorney.Name}}', 'ResponsibleAttorney', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:24:10.646', '2026-11-25 09:24:10.646'),
('17a33368-1852-4353-b99b-e60413abef57', '852400e2-7592-4ca8-a194-fbc1bf456fb1', '{{Client.Name}}', 'Client', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:42:52.489', '2026-11-25 09:42:52.489'),
('17acc7ae-671b-4a33-a312-e0215cea649b', '4189fd31-bd9b-4fce-ad0f-0e859a2cdb7d', '{{Matter.MatterNumber}}', 'Matter', 'matterNumber', 1, NULL, 'NONE', NULL, '2026-11-25 09:10:10.077', '2026-11-25 09:10:10.077'),
('17ae1af3-052b-4b2f-86de-a08409446889', '89bfc8b5-afc6-4a24-a9fd-f558824dc2c7', '{{Client.Name}}', 'Client', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:38:43.357', '2026-11-25 09:38:43.357'),
('17ccd091-ce19-46cc-bba3-f47f58c88f6f', 'a7792ca7-8658-4169-85b1-dbda0042f131', '{{Matter.Title}}', 'Matter', 'title', 1, NULL, 'NONE', NULL, '2026-11-25 09:37:27.290', '2026-11-25 09:37:27.290'),
('18161f68-5152-441f-93b0-56800950572f', '8ae67bb4-028f-4dfb-8a6b-bce202e8f897', '{{Matter.Title}}', 'Matter', 'title', 1, NULL, 'NONE', NULL, '2026-11-25 09:18:57.448', '2026-11-25 09:18:57.448'),
('1855d4ee-0708-440f-a507-3fd42e47225a', '592f3f30-cc15-4dbf-8cbe-976516e0ea61', '{{Matter.Title}}', 'Matter', 'title', 1, NULL, 'NONE', NULL, '2026-11-25 09:39:20.650', '2026-11-25 09:39:20.650'),
('188b21cf-ac2f-4992-91c9-ba0e548f25b9', 'bdbbe799-0966-4ffc-8c57-858e9721bb25', '{{Insurance.ClaimNumber}}', 'Insurance', 'claimNumber', 0, NULL, 'NONE', NULL, '2026-11-25 09:14:22.018', '2026-11-25 09:14:22.018'),
('18b12900-891e-485f-bd8c-6f9d0c7eb10c', '743bda6c-ef38-42c4-9876-5bb952ba909e', '{{Insurance.ClaimNumber}}', 'Insurance', 'claimNumber', 0, NULL, 'NONE', NULL, '2026-11-25 09:37:40.653', '2026-11-25 09:37:40.653'),
('18c5901f-4b62-408d-a199-b25048246afc', '55e6d123-74ea-443a-8bee-7a7913b1b687', '{{Matter.Title}}', 'Matter', 'title', 1, NULL, 'NONE', NULL, '2026-11-25 09:37:08.500', '2026-11-25 09:37:08.500'),
('18d9aaa3-eb40-4c2f-9188-ae9d6ed84152', 'f0f60427-2e97-4056-bd3a-cf9f245eae61', '{{Insurance.ClaimNumber}}', 'Insurance', 'claimNumber', 0, NULL, 'NONE', NULL, '2026-11-25 09:38:53.675', '2026-11-25 09:38:53.675'),
('18eb988e-d82d-46ab-84f1-f358fa98dbfb', '114c5862-b73f-48ee-a72c-615ed35537b3', '{{Matter.MatterNumber}}', 'Matter', 'matterNumber', 1, NULL, 'NONE', NULL, '2026-11-25 09:24:04.682', '2026-11-25 09:24:04.682'),
('1953d11e-4a91-4f78-a2a6-fe02a14fd4f2', '646b3030-53a2-4823-8beb-0a9acb9a9610', '{{Matter.Title}}', 'Matter', 'title', 1, NULL, 'NONE', NULL, '2026-11-25 09:41:09.163', '2026-11-25 09:41:09.163'),
('19a0ac2c-59d9-49c2-94f9-6fe4bd29da5d', 'b851d494-c520-40cd-a7be-db993a2ea218', '{{Matter.MatterNumber}}', 'Matter', 'matterNumber', 1, NULL, 'NONE', NULL, '2026-11-25 09:07:16.221', '2026-11-25 09:07:16.221'),
('19a492eb-621a-47f3-8b1e-a9a1d95bf236', '82f334d4-a724-4cf7-834d-e7ffeb29d708', '{{Client.Name}}', 'Client', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:43:26.986', '2026-11-25 09:43:26.986'),
('19b9918d-8442-4e6f-ac12-f4880f3e9c63', '8a3a335c-5720-4c7a-8b84-63dd8464de50', '{{Matter.MatterNumber}}', 'Matter', 'matterNumber', 1, NULL, 'NONE', NULL, '2026-11-25 09:07:43.776', '2026-11-25 09:07:43.776'),
('19c55de4-e81e-41e9-95df-cacee44c0e6e', 'cf3f8036-b51a-4805-9815-f7e0ab87f802', '{{Attorney.Name}}', 'ResponsibleAttorney', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:25:10.406', '2026-11-25 09:25:10.406'),
('1a09daa9-d523-4762-8514-516486036079', 'a67d6b40-ebe4-4ea6-8415-365ae7961f61', '{{Attorney.Name}}', 'ResponsibleAttorney', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:44:55.857', '2026-11-25 09:44:55.857'),
('1aac15e0-fb6e-479f-9ce1-af7ee5007979', '29d5db33-4c61-43b3-b55c-5ca8253f38e0', '{{Matter.MatterNumber}}', 'Matter', 'matterNumber', 1, NULL, 'NONE', NULL, '2026-11-25 09:18:20.075', '2026-11-25 09:18:20.075'),
('1ac39a25-06f9-4cc1-b2db-7c4d038fad29', '17a56c0b-c6dd-4ffe-a43d-9606642e8ed3', '{{MedicalProvider.Name}}', 'MedicalProvider', 'name', 0, NULL, 'NONE', NULL, '2026-11-25 09:23:31.235', '2026-11-25 09:23:31.235'),
('1b4b8f14-2295-4974-b917-e81b8935f170', 'bfca17de-bbd6-4c08-92f0-3f99bfb54785', '{{CurrentDate.Long}}', 'CurrentDate', 'long', 0, NULL, 'NONE', NULL, '2026-11-25 09:39:47.060', '2026-11-25 09:39:47.060'),
('1bde8e80-c35b-4424-a1e7-7c87ebf4e8d0', 'dd990efc-d55c-4258-9f99-222b61fea6f9', '{{Matter.Title}}', 'Matter', 'title', 1, NULL, 'NONE', NULL, '2026-11-25 09:10:27.131', '2026-11-25 09:10:27.131'),
('1c0dd7d8-0b78-48a4-97f0-290980f63b70', 'd4dbbe74-9882-4019-a375-d6771172c7ce', '{{Client.Name}}', 'Client', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:26:44.761', '2026-11-25 09:26:44.761'),
('1c248822-5642-4941-8bd1-0ae6d4ffde4c', 'a5c5977b-441a-4ccb-b7f1-085ce2ccc18f', '{{Client.Name}}', 'Client', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:28:35.656', '2026-11-25 09:28:35.656'),
('1caa93c1-5aa1-4da9-bb9c-b8bafa63206d', '3e064705-e7f1-40a4-95c4-ef2c47f0d106', '{{Client.Name}}', 'Client', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:27:15.761', '2026-11-25 09:27:15.761'),
('1cc8561d-7d01-460b-96d5-b151d2fb8692', '46f31fd0-867e-4edf-bacc-1923e699b8ac', '{{Matter.Title}}', 'Matter', 'title', 1, NULL, 'NONE', NULL, '2026-11-25 09:10:46.357', '2026-11-25 09:10:46.357'),
('1cd29c6d-e0ef-4d41-9c91-522638df8ace', '8ae67bb4-028f-4dfb-8a6b-bce202e8f897', '{{Matter.MatterNumber}}', 'Matter', 'matterNumber', 1, NULL, 'NONE', NULL, '2026-11-25 09:18:57.448', '2026-11-25 09:18:57.448'),
('1ce48b9a-1ebb-4ec4-8655-50d8a0ed343d', '5c4ed245-68df-47de-8fba-a74a422f4820', '{{Client.Name}}', 'Client', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:08:03.435', '2026-11-25 09:08:03.435'),
('1ce69c76-bd71-42f6-983e-38a298976096', 'c09cb221-7da0-4fcd-bc6a-15258f26daf1', '{{Matter.Title}}', 'Matter', 'title', 1, NULL, 'NONE', NULL, '2026-11-25 09:43:00.472', '2026-11-25 09:43:00.472'),
('1d511f31-fda9-4005-b5b6-0baaaab623f3', 'a25a6d17-8108-426c-84a8-84dddb0d4e14', '{{CurrentDate.Long}}', 'CurrentDate', 'long', 0, NULL, 'NONE', NULL, '2026-11-25 09:18:08.122', '2026-11-25 09:18:08.122'),
('1d7ddee8-0283-4ddd-9b84-9a1402cdbf0f', '8ae67bb4-028f-4dfb-8a6b-bce202e8f897', '{{Client.Name}}', 'Client', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:18:57.448', '2026-11-25 09:18:57.448'),
('1d865048-a4e5-4990-ac52-ed436be2dd69', 'bd5f9e2c-a31a-47ab-98fa-b2098f51e5dd', '{{Client.Name}}', 'Client', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:35:14.725', '2026-11-25 09:35:14.725'),
('1da8ff86-1618-419b-933b-78825eafbd94', 'a6c30529-d5fe-4ef6-88f7-5646308ae386', '{{CurrentDate.Long}}', 'CurrentDate', 'long', 0, NULL, 'NONE', NULL, '2026-11-25 09:30:28.757', '2026-11-25 09:30:28.757'),
('1e2d4330-2cc9-4aae-9aa9-2f87fb012dc3', 'd220f2ef-879d-4a4c-baa4-9701c3f16d60', '{{Attorney.Name}}', 'ResponsibleAttorney', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:20:32.818', '2026-11-25 09:20:32.818'),
('1e914382-37fc-40c2-ae94-2ce73f2332ba', '408fd535-3b97-461c-8322-f60137e1dd85', '{{Matter.MatterNumber}}', 'Matter', 'matterNumber', 1, NULL, 'NONE', NULL, '2026-11-25 09:28:53.764', '2026-11-25 09:28:53.764'),
('1e91c542-7d79-4590-a3c0-df6ef4680883', 'c968ff58-b7bc-4390-a9ce-e07e8f62d618', '{{Matter.MatterNumber}}', 'Matter', 'matterNumber', 1, NULL, 'NONE', NULL, '2026-11-25 09:28:41.155', '2026-11-25 09:28:41.155'),
('1ee1476c-b615-49af-a5af-1319767b8f3e', '1268ae6d-8b19-4bfa-876e-155d51e429c9', '{{Attorney.Name}}', 'ResponsibleAttorney', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:10:58.045', '2026-11-25 09:10:58.045'),
('1ee5029c-c4e6-4915-91be-4609be021e9f', 'a96ffd2f-f9c7-45bb-ac53-791da9d25353', '{{Attorney.Name}}', 'ResponsibleAttorney', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:27:27.990', '2026-11-25 09:27:27.990'),
('1f00fe64-11b1-4a48-b326-0573a370c575', '114c5862-b73f-48ee-a72c-615ed35537b3', '{{Client.Name}}', 'Client', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:24:04.682', '2026-11-25 09:24:04.682'),
('1f0f0a07-6711-49e9-b564-b9af4ef2e7c7', '40b1c509-16ea-4fb3-b050-c2dc12af9afa', '{{Matter.Title}}', 'Matter', 'title', 1, NULL, 'NONE', NULL, '2026-11-25 09:35:59.775', '2026-11-25 09:35:59.775'),
('1f1861e1-9c47-443e-89e8-bbe96a3b1351', 'a96ffd2f-f9c7-45bb-ac53-791da9d25353', '{{Matter.Title}}', 'Matter', 'title', 1, NULL, 'NONE', NULL, '2026-11-25 09:27:27.990', '2026-11-25 09:27:27.990'),
('1f5fa12b-56d1-4c14-beb5-b10f5b887b30', '497c01fc-7892-4af1-a8db-5950154bb4bc', '{{Matter.Title}}', 'Matter', 'title', 1, NULL, 'NONE', NULL, '2026-11-25 09:41:29.667', '2026-11-25 09:41:29.667'),
('1f69739b-b9f7-4e84-baac-8392ebac524f', '457c84fb-c3d9-485b-8f89-ed18a04371b7', '{{CurrentDate.Long}}', 'CurrentDate', 'long', 0, NULL, 'NONE', NULL, '2026-11-25 09:19:11.121', '2026-11-25 09:19:11.121'),
('2002ca13-cb58-40a6-8269-81c44937f848', '4a8557bf-69eb-447c-b559-e45c3ee6584d', '{{Matter.MatterNumber}}', 'Matter', 'matterNumber', 1, NULL, 'NONE', NULL, '2026-11-25 09:43:19.390', '2026-11-25 09:43:19.390'),
('2011fb4e-68ae-4e06-91be-9f6438d449f1', '94dfbc9b-cc38-442f-801b-f9c7ffc02668', '{{Attorney.Name}}', 'ResponsibleAttorney', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:17:48.644', '2026-11-25 09:17:48.644'),
('202fde72-306c-48d5-aea6-985d8da762ce', 'c436f021-cecd-4c60-9cba-9fc95cea429c', '{{Attorney.Name}}', 'ResponsibleAttorney', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:34:36.019', '2026-11-25 09:34:36.019'),
('205d9f57-306e-4665-a8a8-18ab12377304', '4226ca5b-e6e1-45d7-9cee-96843614940c', '{{Matter.Title}}', 'Matter', 'title', 1, NULL, 'NONE', NULL, '2026-11-25 09:14:03.120', '2026-11-25 09:14:03.120'),
('20b21df3-9b36-4bb5-827f-c0b522e48042', 'c968ff58-b7bc-4390-a9ce-e07e8f62d618', '{{Client.Name}}', 'Client', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:28:41.155', '2026-11-25 09:28:41.155'),
('20c3e659-20ae-44eb-aad1-cbe58284246b', 'be52925f-f870-4293-bad1-7e3aa928d9b8', '{{Insurance.ClaimNumber}}', 'Insurance', 'claimNumber', 0, NULL, 'NONE', NULL, '2026-11-25 09:14:36.880', '2026-11-25 09:14:36.880'),
('20c93d15-f1fd-4c92-8fdc-3949b3e4098b', '9ab91dff-b35e-4c69-95a1-880497ac24d3', '{{Matter.MatterNumber}}', 'Matter', 'matterNumber', 1, NULL, 'NONE', NULL, '2026-11-25 09:21:48.687', '2026-11-25 09:21:48.687'),
('212c13b5-5dcb-436b-a993-f03de589ea8c', '5bfb7b62-bdf1-4121-be46-0f8efa189962', '{{Client.Name}}', 'Client', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:40:22.102', '2026-11-25 09:40:22.102'),
('2178a32c-cc88-44d1-9210-91390c8ba4d7', '17b2f3bb-0fbb-4884-a827-24f65dc7b81e', '{{Attorney.Name}}', 'ResponsibleAttorney', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:15:27.042', '2026-11-25 09:15:27.042'),
('21ced359-f523-46e4-a1ef-8906fecc9445', '0dd95a0a-5203-4716-ae35-89a0595c46d6', '{{Matter.Title}}', 'Matter', 'title', 1, NULL, 'NONE', NULL, '2026-11-25 09:19:34.708', '2026-11-25 09:19:34.708'),
('21de2c11-4df1-4f3e-bee1-3c6b89926e0b', 'aae4c646-eab5-45dd-97ce-81bb12c1077d', '{{Matter.MatterNumber}}', 'Matter', 'matterNumber', 1, NULL, 'NONE', NULL, '2026-11-25 09:31:24.862', '2026-11-25 09:31:24.862'),
('21ebd7d9-7e29-4492-81c7-668cb7c756ee', '94cd0be6-7b2b-46b8-bf0c-2afb31db795c', '{{Matter.Title}}', 'Matter', 'title', 1, NULL, 'NONE', NULL, '2026-11-25 09:17:06.680', '2026-11-25 09:17:06.680'),
('2271b072-ce83-4910-b31b-de0498ed15e6', 'bdbbe799-0966-4ffc-8c57-858e9721bb25', '{{Matter.Title}}', 'Matter', 'title', 1, NULL, 'NONE', NULL, '2026-11-25 09:14:22.018', '2026-11-25 09:14:22.018'),
('227f8e6a-758d-4d39-a48e-50e18bee7f79', '02f61270-49a4-46bb-87ec-b6a95478b939', '{{Client.Name}}', 'Client', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:08:19.002', '2026-11-25 09:08:19.002'),
('22bb322d-d584-4f45-b8e8-36c59c8303cb', '600309b1-9409-492e-8115-f1cadcf4a2d4', '{{Matter.MatterNumber}}', 'Matter', 'matterNumber', 1, NULL, 'NONE', NULL, '2026-11-25 09:25:34.746', '2026-11-25 09:25:34.746'),
('22f09e2a-fb82-4160-90e1-c237da4dc7ee', '4dd43b62-0d3b-44e7-81cb-7adce004b7a6', '{{Matter.MatterNumber}}', 'Matter', 'matterNumber', 1, NULL, 'NONE', NULL, '2026-11-25 09:34:41.992', '2026-11-25 09:34:41.992'),
('23055960-c625-4971-ac9e-f537c96caca0', 'f1d31e7b-171b-4abc-85e6-4bfd9332fa65', '{{Matter.MatterNumber}}', 'Matter', 'matterNumber', 1, NULL, 'NONE', NULL, '2026-11-25 09:35:38.301', '2026-11-25 09:35:38.301'),
('2314adc2-57c5-43e3-9c9f-032813677fa6', 'd554bfda-8bce-4121-a8fa-a94f5da56ba5', 'Matter.MatterNumber', 'Matter', 'matterNumber', 1, NULL, 'NONE', NULL, '2026-11-14 09:29:36.759', '2026-11-14 09:29:36.759'),
('235787f9-39c2-41f0-9ff4-161c207ad553', '64dd38ea-8636-4110-ada9-9363f9452197', '{{Attorney.Name}}', 'ResponsibleAttorney', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:28:29.468', '2026-11-25 09:28:29.468'),
('23dce919-e621-4440-98e3-77838da9b891', 'd9c65b2f-6e94-46e1-81c0-92616ad8d297', '{{Matter.Title}}', 'Matter', 'title', 1, NULL, 'NONE', NULL, '2026-11-25 09:11:06.672', '2026-11-25 09:11:06.672'),
('23f754e0-9eec-47cc-ad6f-63b7ee561ac5', '6e95af9d-a68a-4956-9c62-18e934c98f1d', '{{Attorney.Name}}', 'ResponsibleAttorney', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:39:08.714', '2026-11-25 09:39:08.714'),
('243f6871-8f00-4e97-b68b-a21d34d62034', '23bb7516-3519-4d23-ba71-d470de1605e0', '{{Attorney.Name}}', 'ResponsibleAttorney', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:42:15.911', '2026-11-25 09:42:15.911'),
('246016e9-ea31-4e00-a3c1-f9c3f8a5ded2', 'b726e008-8057-43b2-88b6-e77d1b970af8', '{{Matter.MatterNumber}}', 'Matter', 'matterNumber', 1, NULL, 'NONE', NULL, '2026-11-25 09:15:54.643', '2026-11-25 09:15:54.643'),
('24abcaec-7f6d-4b77-943b-5de109497d56', 'c64b8f15-6e35-40c5-8c00-789f96d081f5', '{{Matter.MatterNumber}}', 'Matter', 'matterNumber', 1, NULL, 'NONE', NULL, '2026-11-25 09:29:54.499', '2026-11-25 09:29:54.499'),
('24ad05be-26ad-4ade-82aa-ee885493bc92', '9024acc9-4c92-4c96-b980-7c11389d10a9', '{{Matter.MatterNumber}}', 'Matter', 'matterNumber', 1, NULL, 'NONE', NULL, '2026-11-25 09:38:02.180', '2026-11-25 09:38:02.180'),
('258cf8ca-2d86-46cc-b7c6-fabcb05eb043', '1502c247-62a3-4463-81ad-ca1409cdd1a9', '{{Matter.Title}}', 'Matter', 'title', 1, NULL, 'NONE', NULL, '2026-11-25 09:27:01.396', '2026-11-25 09:27:01.396'),
('25d2081e-4446-4dfc-b180-60631f9566d9', '60d52c8c-966e-4e95-b691-cbc80e8d385f', '{{Attorney.Name}}', 'ResponsibleAttorney', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:39:41.551', '2026-11-25 09:39:41.551'),
('25d5bdce-4609-4dce-9b3f-fdf51d479407', '9c67f9f1-d35c-4140-aa89-9d63475911cb', '{{Matter.Title}}', 'Matter', 'title', 1, NULL, 'NONE', NULL, '2026-11-25 09:37:47.374', '2026-11-25 09:37:47.374'),
('25f498c3-8c1c-4be0-84d6-593047387026', 'ec1c0e31-fed1-4081-9ec7-c1588deef41e', '{{Matter.MatterNumber}}', 'Matter', 'matterNumber', 1, NULL, 'NONE', NULL, '2026-11-25 09:35:52.189', '2026-11-25 09:35:52.189'),
('2613d096-d552-425a-af7a-8230c68ed640', 'b462c8c5-68e7-491e-886c-59ea27158991', '{{Matter.Title}}', 'Matter', 'title', 1, NULL, 'NONE', NULL, '2026-11-25 09:26:05.542', '2026-11-25 09:26:05.542'),
('2690e771-d24a-47e5-890c-a63df335eee1', '73efedfc-9f48-4cbe-960a-523e0de00400', '{{Matter.MatterNumber}}', 'Matter', 'matterNumber', 1, NULL, 'NONE', NULL, '2026-11-25 09:21:03.947', '2026-11-25 09:21:03.947'),
('26a0e795-335d-4922-bbf2-a06fbcc9a014', 'bdbbe799-0966-4ffc-8c57-858e9721bb25', '{{Client.Name}}', 'Client', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:14:22.018', '2026-11-25 09:14:22.018'),
('26a63e37-0e06-472a-809d-0c34d127d2a2', '77fcdc30-31b1-4157-a660-84554edc5518', '{{Attorney.Name}}', 'ResponsibleAttorney', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:20:17.652', '2026-11-25 09:20:17.652'),
('26b59075-44df-4581-a0af-89cd1003358b', 'cda60690-b708-484d-b818-da492d1ec9f4', '{{Client.Name}}', 'Client', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:20:00.458', '2026-11-25 09:20:00.458'),
('26bd5264-aaf9-4360-80fd-4d1cc5c423df', 'b462c8c5-68e7-491e-886c-59ea27158991', '{{MedicalProvider.Name}}', 'MedicalProvider', 'name', 0, NULL, 'NONE', NULL, '2026-11-25 09:26:05.542', '2026-11-25 09:26:05.542'),
('26c76d57-a67f-47a0-a0e3-eda34950b8d3', '23677d2e-5004-42ab-9cf0-46261d6258e5', '{{Matter.Title}}', 'Matter', 'title', 1, NULL, 'NONE', NULL, '2026-11-25 09:40:34.614', '2026-11-25 09:40:34.614'),
('26d9c874-d018-443c-9404-d04416021349', 'ffd84a63-15dd-4736-ac53-3cdf07c061d1', '{{Client.Name}}', 'Client', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:06:41.631', '2026-11-25 09:06:41.631'),
('26dd3585-e830-4064-8f5d-4a758fd37a1c', '29d5db33-4c61-43b3-b55c-5ca8253f38e0', '{{Attorney.Name}}', 'ResponsibleAttorney', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:18:20.075', '2026-11-25 09:18:20.075'),
('27029106-9e99-45d3-be0f-e4447b6f049f', '3f0f23bb-0dd8-403d-ae37-f520c2cf7c4c', '{{Attorney.Name}}', 'ResponsibleAttorney', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:13:30.201', '2026-11-25 09:13:30.201'),
('2757549c-4e5f-44b7-81e3-1062bbf1986d', 'd37ef01a-3309-47ed-99fd-c75e91b05574', '{{Matter.Title}}', 'Matter', 'title', 1, NULL, 'NONE', NULL, '2026-11-25 09:20:26.060', '2026-11-25 09:20:26.060'),
('277c84e6-6b69-45db-85cc-918b5d78d9fb', 'eb6ab9da-aa7c-44b0-93d2-47e002eefd78', '{{Matter.Title}}', 'Matter', 'title', 1, NULL, 'NONE', NULL, '2026-11-25 09:21:31.807', '2026-11-25 09:21:31.807'),
('27892adb-0e3b-4926-9d62-72f4dbb60a5e', '0015843c-7e56-4ddd-8825-b5d85bc450df', '{{Client.Name}}', 'Client', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:26:37.754', '2026-11-25 09:26:37.754'),
('27ae1ab0-0534-40ec-9be9-7334bc1dcef6', '863ecb6b-acb2-468e-8280-6869008e38c4', '{{Attorney.Name}}', 'ResponsibleAttorney', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:25:40.453', '2026-11-25 09:25:40.453'),
('27df219e-77bf-4ebb-96b0-acf68c823141', 'eaf9c42d-fa49-4e7f-97e9-106ed7ac79ba', '{{Matter.Title}}', 'Matter', 'title', 1, NULL, 'NONE', NULL, '2026-11-25 09:12:19.440', '2026-11-25 09:12:19.440'),
('284671ac-b511-48dd-ae8a-0b5b19e08ecd', 'e7250e39-5976-4061-9be3-c776a91a40d3', '{{Client.Name}}', 'Client', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:27:08.713', '2026-11-25 09:27:08.713'),
('28799801-4981-4867-bb8c-38ee305cc2a5', '5ba7f4b1-3bfe-41f2-b66a-9d4d563937e2', '{{Matter.Title}}', 'Matter', 'title', 1, NULL, 'NONE', NULL, '2026-11-25 09:29:43.089', '2026-11-25 09:29:43.089'),
('28ad3bd2-9b94-4e3a-b4a2-e1ce00ae81af', '76395bd0-02c0-43be-8bbc-63a75e09d00d', '{{Attorney.Name}}', 'ResponsibleAttorney', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:12:48.006', '2026-11-25 09:12:48.006'),
('28cb4a60-9408-4205-9a06-3ba4609afb64', '0dd95a0a-5203-4716-ae35-89a0595c46d6', '{{Attorney.Name}}', 'ResponsibleAttorney', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:19:34.708', '2026-11-25 09:19:34.708'),
('28f5eb77-48cf-40ca-9254-ee605169b7c5', '30de11a9-0130-4ce3-a0a4-0c8dd83ffc8b', '{{Client.Name}}', 'Client', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:36:14.287', '2026-11-25 09:36:14.287'),
('29314ed3-be3e-4db8-bd78-ea6c20863309', 'ad50cecb-c9da-4316-8604-9bb9c54fe810', '{{Client.Name}}', 'Client', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:32:36.184', '2026-11-25 09:32:36.184'),
('297a44b2-2e1a-4fb4-a8e8-a78c83b591f9', '4dd43b62-0d3b-44e7-81cb-7adce004b7a6', '{{Client.Name}}', 'Client', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:34:41.992', '2026-11-25 09:34:41.992'),
('29d4cf33-a17e-46ad-9663-127914a20471', '3d93dfc7-961e-4026-b271-9ba36c32e208', '{{Matter.MatterNumber}}', 'Matter', 'matterNumber', 1, NULL, 'NONE', NULL, '2026-11-25 09:09:52.800', '2026-11-25 09:09:52.800'),
('29e52abc-384a-48ce-adff-bd0b03bf6c07', '60d1ffef-c3d2-4057-9737-b1eae70d5f43', '{{Insurance.ClaimNumber}}', 'Insurance', 'claimNumber', 0, NULL, 'NONE', NULL, '2026-11-25 09:29:31.214', '2026-11-25 09:29:31.214'),
('2a2fd5f9-4266-42fb-ac42-18d3e1d52078', '32f25e0b-12dd-48ac-ac0d-c0a67fdaf285', '{{Client.Name}}', 'Client', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:36:20.721', '2026-11-25 09:36:20.721'),
('2a3a2df5-9caf-4acb-a47a-b8f30e5f5866', '25531579-7684-49e9-ab21-c54085ab9f06', '{{Attorney.Name}}', 'ResponsibleAttorney', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:33:15.311', '2026-11-25 09:33:15.311'),
('2a803dee-cf1c-4156-8825-73881dbb842d', 'bfca17de-bbd6-4c08-92f0-3f99bfb54785', '{{Attorney.Name}}', 'ResponsibleAttorney', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:39:47.060', '2026-11-25 09:39:47.060'),
('2a95df94-f36f-4218-b26d-63a4ec2a27dc', '57a5bfb2-dd4c-4b48-84be-e2d51eb69b99', '{{Matter.Title}}', 'Matter', 'title', 1, NULL, 'NONE', NULL, '2026-11-25 09:22:53.102', '2026-11-25 09:22:53.102'),
('2aa3bce8-7fad-484b-8f86-1d2fc72704f5', 'f6f0f444-c32f-4188-943b-0ba2dcb10cd4', '{{Client.Name}}', 'Client', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:34:04.500', '2026-11-25 09:34:04.500'),
('2aab8ba6-a837-4d06-ba82-93c8b521c678', '23bb7516-3519-4d23-ba71-d470de1605e0', '{{Client.Name}}', 'Client', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:42:15.911', '2026-11-25 09:42:15.911'),
('2ad8f1c3-13b8-4f75-be0f-ec19e6a469f9', '7619287d-b2b5-4020-a2f8-af71d2726f35', '{{Client.Name}}', 'Client', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:45:28.746', '2026-11-25 09:45:28.746'),
('2b3d852f-8f57-4cff-a797-791cd37ffcdb', 'f1d31e7b-171b-4abc-85e6-4bfd9332fa65', '{{Matter.Title}}', 'Matter', 'title', 1, NULL, 'NONE', NULL, '2026-11-25 09:35:38.301', '2026-11-25 09:35:38.301'),
('2bb3effe-5f11-4ee6-b2e4-6d211ddf3bc6', 'be52925f-f870-4293-bad1-7e3aa928d9b8', '{{Attorney.Name}}', 'ResponsibleAttorney', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:14:36.880', '2026-11-25 09:14:36.880'),
('2bdcdad5-443c-44d6-aeb5-7fdb3f499f69', 'eb6ab9da-aa7c-44b0-93d2-47e002eefd78', '{{Insurance.CarrierName}}', 'Insurance', 'insuranceCompany', 0, NULL, 'NONE', NULL, '2026-11-25 09:21:31.807', '2026-11-25 09:21:31.807'),
('2c5bf165-f14a-4dd4-a497-f1364e402034', '5da49101-918d-4970-8839-06070643f366', '{{Client.Name}}', 'Client', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:24:30.718', '2026-11-25 09:24:30.718'),
('2c66e609-b746-4c2d-bb60-50e17f3eb144', '04d4f9e6-5cb9-430c-9102-a9532ca61256', '{{Client.Name}}', 'Client', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:27:59.859', '2026-11-25 09:27:59.859'),
('2c7d3d7c-c67e-4f10-99ca-078621951a79', 'a0952cf1-1670-4189-8513-382751260037', '{{Matter.Title}}', 'Matter', 'title', 1, NULL, 'NONE', NULL, '2026-11-25 09:43:07.970', '2026-11-25 09:43:07.970');
INSERT INTO `document_field_mappings` (`id`, `template_version_id`, `placeholder_tag`, `source_entity`, `source_field`, `is_required`, `default_value`, `formatting_rule`, `conditional_expression`, `created_at`, `updated_at`) VALUES
('2cd2e20c-fc79-4272-8e29-5eef06d54317', '7c968a6f-a8ff-49dd-a563-671184d476f0', '{{Attorney.Name}}', 'ResponsibleAttorney', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:10:37.449', '2026-11-25 09:10:37.449'),
('2cd6fbed-58e5-4248-a606-782a84cfc879', 'a0952cf1-1670-4189-8513-382751260037', '{{Matter.MatterNumber}}', 'Matter', 'matterNumber', 1, NULL, 'NONE', NULL, '2026-11-25 09:43:07.970', '2026-11-25 09:43:07.970'),
('2d0b056c-a21d-4e74-a3c5-cb64b1d286d4', 'a9155966-0259-44c6-b2d3-e443b4534244', '{{Attorney.Name}}', 'ResponsibleAttorney', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:24:18.065', '2026-11-25 09:24:18.065'),
('2d0d8482-d22f-40b6-a7fa-5cc98575ec22', '76a7a39b-0455-4895-8841-3f04be9358e1', '{{Attorney.Name}}', 'ResponsibleAttorney', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:45:23.110', '2026-11-25 09:45:23.110'),
('2d3381d8-82f9-44c4-b187-ff1420180d8d', '8beb6f2e-6342-4443-b215-aaa6e92c6614', '{{Attorney.Name}}', 'ResponsibleAttorney', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:07:05.165', '2026-11-25 09:07:05.165'),
('2d4b1a7a-a528-4484-853b-da879e394557', '6cd5cc86-0fd6-4dbe-b6a2-9ec56b0b5d54', '{{Attorney.Name}}', 'ResponsibleAttorney', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:12:09.936', '2026-11-25 09:12:09.936'),
('2d556f1b-cb7d-44fa-92f9-712c63dd2b5d', 'df3e25c5-5690-4157-99b0-8313f33d326b', '{{Attorney.Name}}', 'ResponsibleAttorney', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:22:27.806', '2026-11-25 09:22:27.806'),
('2d748485-16f0-4bfc-bf10-31d5441c31c8', '0e4344b0-09b4-4cdd-8f95-c257f94fdc79', '{{Client.Name}}', 'Client', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:22:04.507', '2026-11-25 09:22:04.507'),
('2dc33f81-87f6-456a-b129-e840b29185e9', 'f512924e-1ce1-4f7c-8a32-1b102bed96b8', '{{Insurance.ClaimNumber}}', 'Insurance', 'claimNumber', 0, NULL, 'NONE', NULL, '2026-11-25 09:21:39.574', '2026-11-25 09:21:39.574'),
('2de07e85-106a-4343-a531-133babd9dc79', '5d6da4fd-169a-4e72-a1f3-88e6ab30e6af', '{{Matter.Title}}', 'Matter', 'title', 1, NULL, 'NONE', NULL, '2026-11-25 09:18:40.684', '2026-11-25 09:18:40.684'),
('2e1f0bd3-1e2a-4c8b-b6a8-5221b56b4a6a', '57a5bfb2-dd4c-4b48-84be-e2d51eb69b99', '{{MedicalProvider.Name}}', 'MedicalProvider', 'name', 0, NULL, 'NONE', NULL, '2026-11-25 09:22:53.102', '2026-11-25 09:22:53.102'),
('2e39a3ed-53bf-4e59-9cdc-a5ec6bdedcb7', '1287a3a4-02d3-4c40-85a0-194b36a3e598', '{{Client.Name}}', 'Client', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:20:55.585', '2026-11-25 09:20:55.585'),
('2e5696dc-dd2b-4b88-8aa0-547751bd432c', '5dec737b-658f-47fb-9d9c-5f761ab5d42f', '{{Matter.MatterNumber}}', 'Matter', 'matterNumber', 1, NULL, 'NONE', NULL, '2026-11-25 09:30:35.622', '2026-11-25 09:30:35.622'),
('2e8a7cff-2013-40c9-a499-65fa4e3853ff', '17b2f3bb-0fbb-4884-a827-24f65dc7b81e', '{{Matter.Title}}', 'Matter', 'title', 1, NULL, 'NONE', NULL, '2026-11-25 09:15:27.042', '2026-11-25 09:15:27.042'),
('2e959572-a28d-4443-9bd9-3aa5b60a02ec', '3e010dc9-fa85-4ad9-8a07-540f5b72d1ea', '{{Client.Name}}', 'Client', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:44:14.592', '2026-11-25 09:44:14.592'),
('2eb24823-9e61-4a1d-a6cf-fc36d1c7779b', 'a1ae9879-d795-4d25-b0fc-2536ccb1031e', '{{Matter.MatterNumber}}', 'Matter', 'matterNumber', 1, NULL, 'NONE', NULL, '2026-11-25 09:12:38.790', '2026-11-25 09:12:38.790'),
('2ed753e8-c203-4b3f-8aed-890e24c43fdd', '3e0af65d-626c-4468-8b9b-6b10b044165b', '{{Matter.Title}}', 'Matter', 'title', 1, NULL, 'NONE', NULL, '2026-11-25 09:16:39.847', '2026-11-25 09:16:39.847'),
('2f41b993-9e29-40d6-871b-f59672568aea', '57a5bfb2-dd4c-4b48-84be-e2d51eb69b99', '{{Matter.MatterNumber}}', 'Matter', 'matterNumber', 1, NULL, 'NONE', NULL, '2026-11-25 09:22:53.102', '2026-11-25 09:22:53.102'),
('2f526dc5-e484-477d-bf25-49819ba017dd', '457c84fb-c3d9-485b-8f89-ed18a04371b7', '{{Attorney.Name}}', 'ResponsibleAttorney', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:19:11.121', '2026-11-25 09:19:11.121'),
('2f7960fd-4c44-4040-b1c5-fb7e3ba35e1a', 'dd990efc-d55c-4258-9f99-222b61fea6f9', '{{Matter.MatterNumber}}', 'Matter', 'matterNumber', 1, NULL, 'NONE', NULL, '2026-11-25 09:10:27.131', '2026-11-25 09:10:27.131'),
('2f8039cf-4135-4b2d-8bd1-3e10abd1202a', 'ace0b629-cae7-4260-93af-3643d8d3dd58', '{{Matter.MatterNumber}}', 'Matter', 'matterNumber', 1, NULL, 'NONE', NULL, '2026-11-25 09:23:14.204', '2026-11-25 09:23:14.204'),
('2f9216b4-9688-4d27-9e4c-42eecf2fad48', '76a7a39b-0455-4895-8841-3f04be9358e1', '{{Client.Name}}', 'Client', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:45:23.110', '2026-11-25 09:45:23.110'),
('2fa08577-2a50-41fa-a007-b00ab372b7b2', 'c64b8f15-6e35-40c5-8c00-789f96d081f5', '{{Matter.Title}}', 'Matter', 'title', 1, NULL, 'NONE', NULL, '2026-11-25 09:29:54.499', '2026-11-25 09:29:54.499'),
('2fde2251-b68a-42f3-9bad-de7e40fa35d8', '96e98b6c-5022-4a6a-8538-45dea007ec14', '{{Matter.Title}}', 'Matter', 'title', 1, NULL, 'NONE', NULL, '2026-11-25 09:30:03.286', '2026-11-25 09:30:03.286'),
('3016ac2c-5697-4f90-b0dd-7d62f8e20f51', '1bcd8d6e-d341-40f2-a658-171ab595c104', '{{Court.Name}}', 'Court', 'name', 0, NULL, 'NONE', NULL, '2026-11-25 09:42:38.075', '2026-11-25 09:42:38.075'),
('3067b57f-81dd-4ccc-88fa-ca49266e9115', '8fe19204-74cd-40be-ae84-fbe2a03a3803', '{{Client.Name}}', 'Client', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:10:19.043', '2026-11-25 09:10:19.043'),
('307679a6-07fd-48ce-8b52-1f4ba1877a20', '9c13214a-1b1c-4a81-98f5-8e7f02c2bb98', '{{Matter.MatterNumber}}', 'Matter', 'matterNumber', 1, NULL, 'NONE', NULL, '2026-11-25 09:19:21.787', '2026-11-25 09:19:21.787'),
('308b2732-2215-42f6-8541-c0adf4153cad', '25cda274-07df-4c65-88da-f1ff8e45e0dd', '{{Matter.MatterNumber}}', 'Matter', 'matterNumber', 1, NULL, 'NONE', NULL, '2026-11-25 09:22:36.613', '2026-11-25 09:22:36.613'),
('30c9c3cc-616a-46fb-9d66-b0c46e07a48f', '9361319b-c01b-4fd1-93fe-140cea9a86b6', '{{Attorney.Name}}', 'ResponsibleAttorney', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:41:02.182', '2026-11-25 09:41:02.182'),
('30dea8bf-f300-4f20-b934-798ccb83fe0b', '6c598600-36e9-4b4d-a4b8-af354c65699e', '{{Matter.MatterNumber}}', 'Matter', 'matterNumber', 1, NULL, 'NONE', NULL, '2026-11-25 09:34:16.928', '2026-11-25 09:34:16.928'),
('31baeb58-1e06-4a2b-85ce-bcdefbecc002', '6aff411c-53cc-4f49-bda2-ecaad33a950c', '{{Matter.MatterNumber}}', 'Matter', 'matterNumber', 1, NULL, 'NONE', NULL, '2026-11-25 09:43:59.878', '2026-11-25 09:43:59.878'),
('31ef2f70-e86d-47e0-9356-cb3bd221da9e', '30de11a9-0130-4ce3-a0a4-0c8dd83ffc8b', '{{Matter.Title}}', 'Matter', 'title', 1, NULL, 'NONE', NULL, '2026-11-25 09:36:14.287', '2026-11-25 09:36:14.287'),
('32838af6-311f-4a27-840b-ec1afdecdbdb', 'ed751d5b-ec83-4cc5-a512-32cd82650602', '{{Attorney.Name}}', 'ResponsibleAttorney', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:41:49.879', '2026-11-25 09:41:49.879'),
('329c9d37-9864-422c-ad2d-72523836a808', '0e4344b0-09b4-4cdd-8f95-c257f94fdc79', '{{Attorney.Name}}', 'ResponsibleAttorney', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:22:04.507', '2026-11-25 09:22:04.507'),
('32d73451-02db-4ee8-9a4d-78be0ade21c6', 'fdcaea3e-57f2-40dd-ad96-ec8882510a85', '{{Attorney.Name}}', 'ResponsibleAttorney', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:29:08.687', '2026-11-25 09:29:08.687'),
('331e4ccd-ff1b-4ae2-b1b9-b1725c1a1295', 'b726e008-8057-43b2-88b6-e77d1b970af8', '{{Client.Name}}', 'Client', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:15:54.643', '2026-11-25 09:15:54.643'),
('3363bc5f-379f-4ea3-b12b-a4023ada3a3b', 'a5c5977b-441a-4ccb-b7f1-085ce2ccc18f', '{{Attorney.Name}}', 'ResponsibleAttorney', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:28:35.656', '2026-11-25 09:28:35.656'),
('33bc2000-9b23-4dbb-bab0-3cae0e3f729a', 'a5c5977b-441a-4ccb-b7f1-085ce2ccc18f', '{{Matter.MatterNumber}}', 'Matter', 'matterNumber', 1, NULL, 'NONE', NULL, '2026-11-25 09:28:35.656', '2026-11-25 09:28:35.656'),
('33d06f37-369a-40b7-a294-04afb6778900', '926f9447-7b92-4349-b757-c0132e4f8be6', '{{Attorney.Name}}', 'ResponsibleAttorney', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:12:29.314', '2026-11-25 09:12:29.314'),
('3468440f-ffab-48e3-b22e-8156ab790e02', '6d06086f-03a4-44c6-a96d-fc371f6f8967', '{{Attorney.Name}}', 'ResponsibleAttorney', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:44:49.450', '2026-11-25 09:44:49.450'),
('346ac8aa-a6b6-4626-b687-a3c6ec2d45d3', 'a7c0d570-e431-4c48-b4ef-aef8546890ea', '{{Client.Name}}', 'Client', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:16:59.935', '2026-11-25 09:16:59.935'),
('34b75da4-681f-4aaa-bb88-3e1faeeb3fa6', '7619287d-b2b5-4020-a2f8-af71d2726f35', '{{Matter.Title}}', 'Matter', 'title', 1, NULL, 'NONE', NULL, '2026-11-25 09:45:28.746', '2026-11-25 09:45:28.746'),
('354452b0-a3e9-4c92-a856-2c2411ff3590', 'ab0ef57c-1551-4441-b538-de13cf647a2b', '{{CurrentDate.Long}}', 'CurrentDate', 'long', 0, NULL, 'NONE', NULL, '2026-11-25 09:08:39.470', '2026-11-25 09:08:39.470'),
('35511d24-ca7c-46a7-8f50-4c171bde8e59', '852400e2-7592-4ca8-a194-fbc1bf456fb1', '{{Insurance.ClaimNumber}}', 'Insurance', 'claimNumber', 0, NULL, 'NONE', NULL, '2026-11-25 09:42:52.489', '2026-11-25 09:42:52.489'),
('35678ee7-be38-4840-bf93-f61772b349d8', 'c69600cd-b146-4522-aa83-5b71a475f133', '{{Matter.Title}}', 'Matter', 'title', 1, NULL, 'NONE', NULL, '2026-11-25 09:25:03.045', '2026-11-25 09:25:03.045'),
('356996df-7416-4a7c-a779-edd559a1de4a', '30de11a9-0130-4ce3-a0a4-0c8dd83ffc8b', '{{Attorney.Name}}', 'ResponsibleAttorney', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:36:14.287', '2026-11-25 09:36:14.287'),
('358f8583-e4b8-488b-b167-41121c144e76', '9f876323-e455-4913-9232-d561ae223b81', '{{Attorney.Name}}', 'ResponsibleAttorney', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:36:49.099', '2026-11-25 09:36:49.099'),
('35db9cea-d805-40a8-b923-811b93919331', '4a08e886-9403-4d5f-8cf6-8666d9bad508', '{{Matter.MatterNumber}}', 'Matter', 'matterNumber', 1, NULL, 'NONE', NULL, '2026-11-25 09:39:55.755', '2026-11-25 09:39:55.755'),
('35e5b950-7697-4165-9757-714a2cc69225', 'd795264a-186b-4ff7-90ce-a6483dbb71ee', '{{Matter.MatterNumber}}', 'Matter', 'matterNumber', 1, NULL, 'NONE', NULL, '2026-11-25 09:42:01.887', '2026-11-25 09:42:01.887'),
('35f51003-e184-4cc6-a313-5624fa5aa8e0', '0527cd62-fdb7-4653-b0db-0199b267563c', '{{Attorney.Name}}', 'ResponsibleAttorney', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:22:44.662', '2026-11-25 09:22:44.662'),
('35f6f608-80fa-49f6-8053-be23ea3e6115', '5e4e18a0-301e-4bb3-865b-43e3f87e3ac7', '{{Client.Name}}', 'Client', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:09:59.969', '2026-11-25 09:09:59.969'),
('3642c48b-5024-4308-bd86-e1af284a167c', '5347a9ab-7278-4647-bdd5-13d174237f64', '{{Matter.MatterNumber}}', 'Matter', 'matterNumber', 1, NULL, 'NONE', NULL, '2026-11-25 09:34:29.597', '2026-11-25 09:34:29.597'),
('36a107e4-60f8-4d96-82fe-8a93786e25d5', '9ab91dff-b35e-4c69-95a1-880497ac24d3', '{{Matter.Title}}', 'Matter', 'title', 1, NULL, 'NONE', NULL, '2026-11-25 09:21:48.687', '2026-11-25 09:21:48.687'),
('36cd0b2e-047d-4e73-8479-c48c5a8380fa', 'e7250e39-5976-4061-9be3-c776a91a40d3', '{{Matter.Title}}', 'Matter', 'title', 1, NULL, 'NONE', NULL, '2026-11-25 09:27:08.713', '2026-11-25 09:27:08.713'),
('370aa094-c3e6-43d3-b3c7-615ee30d42fd', 'bfca17de-bbd6-4c08-92f0-3f99bfb54785', '{{Matter.MatterNumber}}', 'Matter', 'matterNumber', 1, NULL, 'NONE', NULL, '2026-11-25 09:39:47.060', '2026-11-25 09:39:47.060'),
('3718c0cc-eaa2-4ba8-8474-e1128890a11a', 'd7c3f728-e7aa-4abb-82e1-b77e855808b2', '{{Matter.Title}}', 'Matter', 'title', 1, NULL, 'NONE', NULL, '2026-11-25 09:36:33.810', '2026-11-25 09:36:33.810'),
('3738399c-2f65-49fd-a6c3-bef7cb9319c8', 'a8148ce8-8831-4767-aa6a-677772967a2a', '{{Client.Name}}', 'Client', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:44:28.526', '2026-11-25 09:44:28.526'),
('374b459d-8be2-43f9-9f61-8a44ff40e3a8', '177ddea4-9282-497e-b399-6e5e9cf7c4bc', '{{Matter.MatterNumber}}', 'Matter', 'matterNumber', 1, NULL, 'NONE', NULL, '2026-11-25 09:16:20.040', '2026-11-25 09:16:20.040'),
('375035d6-abe5-4c17-89b1-d773e0a3edff', '8a427a6e-d37a-4951-8cd6-24e4ed518b16', '{{Matter.Title}}', 'Matter', 'title', 1, NULL, 'NONE', NULL, '2026-11-25 09:29:00.511', '2026-11-25 09:29:00.511'),
('375faec9-42a0-434a-a507-a89d6343cba7', 'f0166dee-f985-4d9b-b2de-6cfe1f8ad7d3', '{{Matter.Title}}', 'Matter', 'title', 1, NULL, 'NONE', NULL, '2026-11-25 09:06:57.490', '2026-11-25 09:06:57.490'),
('37883734-69d7-458a-bf31-f804709d2e2a', '2aaef701-5ea8-42cc-b381-3aad1aaac0e3', '{{Attorney.Name}}', 'ResponsibleAttorney', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:11:16.455', '2026-11-25 09:11:16.455'),
('37c98675-1cb6-481f-81b9-ee577f26b987', '0dd95a0a-5203-4716-ae35-89a0595c46d6', '{{Insurance.ClaimNumber}}', 'Insurance', 'claimNumber', 0, NULL, 'NONE', NULL, '2026-11-25 09:19:34.708', '2026-11-25 09:19:34.708'),
('38180a59-7363-4bef-a813-c95c8ca04d3e', '73efedfc-9f48-4cbe-960a-523e0de00400', '{{Client.Name}}', 'Client', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:21:03.947', '2026-11-25 09:21:03.947'),
('381ef872-75e4-459a-9d1c-fdf32db4aaf3', '984370bc-02f5-41d0-b559-2f0031e7ecf0', '{{Matter.MatterNumber}}', 'Matter', 'matterNumber', 1, NULL, 'NONE', NULL, '2026-11-25 09:15:33.591', '2026-11-25 09:15:33.591'),
('383f83e9-dc26-4e4d-a122-3169140c3262', 'a67d6b40-ebe4-4ea6-8415-365ae7961f61', '{{Matter.MatterNumber}}', 'Matter', 'matterNumber', 1, NULL, 'NONE', NULL, '2026-11-25 09:44:55.857', '2026-11-25 09:44:55.857'),
('389194d3-4b75-47c0-979b-8a412dc5a6d4', 'b851d494-c520-40cd-a7be-db993a2ea218', '{{Client.Name}}', 'Client', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:07:16.221', '2026-11-25 09:07:16.221'),
('38f1f693-53c2-49d3-8bb9-d057eb32833d', '34c7c015-df07-496e-ae4a-c4d9cf030a99', '{{Attorney.Name}}', 'ResponsibleAttorney', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:18:50.518', '2026-11-25 09:18:50.518'),
('38f9dead-2f71-4b8d-a469-f02bc2aa4672', '19b4ea63-d6fe-4c78-a4aa-4e15274d8020', '{{Matter.Title}}', 'Matter', 'title', 1, NULL, 'NONE', NULL, '2026-11-25 09:39:14.262', '2026-11-25 09:39:14.262'),
('39b3348c-360d-49b3-be13-0f86e95e7011', '25ed3bd4-4976-43e6-9a0f-75696cae49f6', '{{Matter.Title}}', 'Matter', 'title', 1, NULL, 'NONE', NULL, '2026-11-25 09:37:34.236', '2026-11-25 09:37:34.236'),
('39eb95c7-6891-4d10-a9ec-94fdef3abbaf', '926f9447-7b92-4349-b757-c0132e4f8be6', '{{Matter.MatterNumber}}', 'Matter', 'matterNumber', 1, NULL, 'NONE', NULL, '2026-11-25 09:12:29.314', '2026-11-25 09:12:29.314'),
('3a127460-f1a9-45bf-be5f-3b9ae45a8203', 'b3fa3129-564d-4926-a813-3f343805c94e', '{{CurrentDate.Long}}', 'CurrentDate', 'long', 0, NULL, 'NONE', NULL, '2026-11-25 09:15:02.998', '2026-11-25 09:15:02.998'),
('3a2426dd-05bc-4028-a623-efef20688335', 'c8e2f1fe-5365-44b5-a497-437d71a02c2d', '{{Matter.MatterNumber}}', 'Matter', 'matterNumber', 1, NULL, 'NONE', NULL, '2026-11-25 09:26:22.331', '2026-11-25 09:26:22.331'),
('3a4a82f1-071f-483c-9be2-2258c79b0b07', '1c97c77a-8d55-4921-b569-90482c80ddac', '{{Attorney.Name}}', 'ResponsibleAttorney', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:27:41.448', '2026-11-25 09:27:41.448'),
('3a7a0176-7cc7-47df-8c94-ec9351d52233', '711d7253-2ea0-4e60-81b3-fb542fd7c2fa', '{{Client.Name}}', 'Client', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:13:17.503', '2026-11-25 09:13:17.503'),
('3ab0e43d-2e3c-45a1-b624-b995ff10724a', '94dfbc9b-cc38-442f-801b-f9c7ffc02668', '{{Matter.Title}}', 'Matter', 'title', 1, NULL, 'NONE', NULL, '2026-11-25 09:17:48.644', '2026-11-25 09:17:48.644'),
('3ae75ef9-0914-4a87-af0e-3b5706ced3ba', '53ff8796-c10e-45df-b002-dfdaf2e6f77a', '{{Matter.MatterNumber}}', 'Matter', 'matterNumber', 1, NULL, 'NONE', NULL, '2026-11-25 09:16:26.633', '2026-11-25 09:16:26.633'),
('3b6ff86b-671a-4f6e-a601-444f0945fda0', '77fcdc30-31b1-4157-a660-84554edc5518', '{{Client.Name}}', 'Client', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:20:17.652', '2026-11-25 09:20:17.652'),
('3b9247c4-089c-453d-8f63-4a5344f33aab', 'dd990efc-d55c-4258-9f99-222b61fea6f9', '{{Attorney.Name}}', 'ResponsibleAttorney', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:10:27.131', '2026-11-25 09:10:27.131'),
('3bb51fe3-cb35-48af-861f-5742d3e1eba9', 'f1b41b5d-de04-4418-85e1-9788310606e7', '{{Matter.MatterNumber}}', 'Matter', 'matterNumber', 1, NULL, 'NONE', NULL, '2026-11-25 09:29:24.130', '2026-11-25 09:29:24.130'),
('3bb8d8ce-d7fa-49a9-96ed-04b811365199', '2921473b-3172-4a76-9567-4533d18df0a9', '{{Matter.Title}}', 'Matter', 'title', 1, NULL, 'NONE', NULL, '2026-11-25 09:18:33.651', '2026-11-25 09:18:33.651'),
('3bc891c2-0fbf-42f8-b892-60e7a24a5d9c', '14fc15d3-97ad-4511-8d69-9173305d7e50', '{{Client.Name}}', 'Client', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:35:06.952', '2026-11-25 09:35:06.952'),
('3bdd00a7-cb95-4912-9577-afc5f2db03ef', '5d439c99-f896-4a7f-99e9-3f7c2bf237a9', '{{Client.Name}}', 'Client', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:20:48.401', '2026-11-25 09:20:48.401'),
('3bf378a6-cb60-4725-a882-bad782f78418', '61ce7918-34d9-4ca7-955c-4fc895d710ef', '{{Attorney.Name}}', 'ResponsibleAttorney', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:14:11.412', '2026-11-25 09:14:11.412'),
('3c5ee49f-7f24-4b4b-80d6-de45c1bec67a', 'c4dad4e6-b06d-4b22-acfe-86fcc2611079', '{{Matter.MatterNumber}}', 'Matter', 'matterNumber', 1, NULL, 'NONE', NULL, '2026-11-25 09:36:07.075', '2026-11-25 09:36:07.075'),
('3c712c5d-386a-43f2-9cfc-477dd383ad2d', 'c74c8d8a-da5f-45a1-b4d9-37382fa0edc7', '{{Matter.MatterNumber}}', 'Matter', 'matterNumber', 1, NULL, 'NONE', NULL, '2026-11-25 09:07:28.820', '2026-11-25 09:07:28.820'),
('3c94a42f-66b7-441a-b966-34826d5890a1', '14fc15d3-97ad-4511-8d69-9173305d7e50', '{{Matter.Title}}', 'Matter', 'title', 1, NULL, 'NONE', NULL, '2026-11-25 09:35:06.952', '2026-11-25 09:35:06.952'),
('3cb80278-986d-49b2-a0e8-190e79e2a7a0', 'e7b63652-7194-4fd0-923c-6e5cc1cc7975', '{{Client.Name}}', 'Client', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:24:10.646', '2026-11-25 09:24:10.646'),
('3cbc94a7-7d26-4151-8403-2015bc2708c0', '5c4ed245-68df-47de-8fba-a74a422f4820', '{{Matter.MatterNumber}}', 'Matter', 'matterNumber', 1, NULL, 'NONE', NULL, '2026-11-25 09:08:03.435', '2026-11-25 09:08:03.435'),
('3cbcae46-6644-467d-8071-b977f8ee4965', '1268ae6d-8b19-4bfa-876e-155d51e429c9', '{{Matter.Title}}', 'Matter', 'title', 1, NULL, 'NONE', NULL, '2026-11-25 09:10:58.045', '2026-11-25 09:10:58.045'),
('3cc529d8-97b4-47ac-81bb-89bb1e71df0a', '3f0f23bb-0dd8-403d-ae37-f520c2cf7c4c', '{{Matter.Title}}', 'Matter', 'title', 1, NULL, 'NONE', NULL, '2026-11-25 09:13:30.201', '2026-11-25 09:13:30.201'),
('3d1c30f7-ad12-4c13-9401-ead1d5054e41', 'c59cf2fd-2725-4f2d-ad2c-f2023addff3e', '{{CurrentDate.Long}}', 'CurrentDate', 'long', 0, NULL, 'NONE', NULL, '2026-11-25 09:43:34.906', '2026-11-25 09:43:34.906'),
('3d2c2153-c229-4d72-ad92-a77a76b593a8', '53ff8796-c10e-45df-b002-dfdaf2e6f77a', '{{Matter.Title}}', 'Matter', 'title', 1, NULL, 'NONE', NULL, '2026-11-25 09:16:26.633', '2026-11-25 09:16:26.633'),
('3d594cc1-7f8c-497e-a33e-fb1195303f43', 'ad50cecb-c9da-4316-8604-9bb9c54fe810', '{{Attorney.Name}}', 'ResponsibleAttorney', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:32:36.184', '2026-11-25 09:32:36.184'),
('3d6cda7c-a757-44dc-b679-acafafb2d8a0', '673e6316-9e22-4650-8bbc-f87f1a2f7e3a', '{{Matter.Title}}', 'Matter', 'title', 1, NULL, 'NONE', NULL, '2026-11-25 09:25:21.556', '2026-11-25 09:25:21.556'),
('3dd849ad-31f4-4902-9b8f-cfab2a7443bd', 'a967c641-7597-468e-bfa1-bccc3668a316', '{{Incident.AccidentDate}}', 'Incident', 'accidentDate', 0, NULL, 'DATE_LONG', NULL, '2026-11-25 09:23:57.599', '2026-11-25 09:23:57.599'),
('3e74db9e-e930-4068-9a3f-a3f76c0f5fd1', 'b34abf61-fe95-49b8-810d-c4aca66effd6', '{{Client.Name}}', 'Client', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:34:49.041', '2026-11-25 09:34:49.041'),
('3e94544c-33a6-4d94-9a99-1c90c70e87a2', 'f3c5d700-e6d6-4bf5-ab31-1e450d09a991', '{{Attorney.Name}}', 'ResponsibleAttorney', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:18:14.290', '2026-11-25 09:18:14.290'),
('3e946e7f-2cb7-4178-94e5-64e434061c49', 'f1de25a4-0c3e-4065-8ed5-d194d16ccebd', '{{Client.Name}}', 'Client', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:18:01.776', '2026-11-25 09:18:01.776'),
('3eab8ae5-1f2f-4d67-aa44-c5568e114371', '04d4f9e6-5cb9-430c-9102-a9532ca61256', '{{Matter.MatterNumber}}', 'Matter', 'matterNumber', 1, NULL, 'NONE', NULL, '2026-11-25 09:27:59.859', '2026-11-25 09:27:59.859'),
('3ebd627a-5c32-49d9-b957-60d50d0447b6', '0ad99ee2-841e-468d-98b1-a51f2e5b51ee', '{{Matter.MatterNumber}}', 'Matter', 'matterNumber', 1, NULL, 'NONE', NULL, '2026-11-25 09:21:13.110', '2026-11-25 09:21:13.110'),
('3eee4fe5-2bf2-4d41-8548-e3701e57ada1', '457c84fb-c3d9-485b-8f89-ed18a04371b7', '{{Client.Name}}', 'Client', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:19:11.121', '2026-11-25 09:19:11.121'),
('3ef234d2-9eee-4b34-b8cd-298143725e21', '0e4344b0-09b4-4cdd-8f95-c257f94fdc79', '{{Matter.MatterNumber}}', 'Matter', 'matterNumber', 1, NULL, 'NONE', NULL, '2026-11-25 09:22:04.507', '2026-11-25 09:22:04.507'),
('3f0cb226-b48f-464f-9595-e198e10c7455', 'c2303872-a179-4c73-93f2-941c4abcbc6d', '{{Insurance.ClaimNumber}}', 'Insurance', 'claimNumber', 0, NULL, 'NONE', NULL, '2026-11-25 09:24:55.871', '2026-11-25 09:24:55.871'),
('3f14eec5-e58f-4487-a39d-00bb08838bda', '192fa43c-6472-473c-a04b-d0e469bd25c8', '{{Client.Name}}', 'Client', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:38:15.749', '2026-11-25 09:38:15.749'),
('3f4c7692-4788-499b-bb32-8f85f186569c', 'df3e25c5-5690-4157-99b0-8313f33d326b', '{{Matter.MatterNumber}}', 'Matter', 'matterNumber', 1, NULL, 'NONE', NULL, '2026-11-25 09:22:27.806', '2026-11-25 09:22:27.806'),
('3fb4ca6d-4714-4cb0-a3c3-9d7aa0e06d12', '6cf69812-251b-4c6b-a300-5f54eef3c0c5', '{{Matter.Title}}', 'Matter', 'title', 1, NULL, 'NONE', NULL, '2026-11-25 09:26:14.955', '2026-11-25 09:26:14.955'),
('3fe108e2-a954-4e1a-a95c-9d0e8efcceb2', '5c908fec-6fd2-4583-8543-7d9d3047abc0', '{{Attorney.Name}}', 'ResponsibleAttorney', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:33:57.709', '2026-11-25 09:33:57.709'),
('3fea1c45-dead-4797-8720-ecdb63dd9b56', '497c01fc-7892-4af1-a8db-5950154bb4bc', '{{Attorney.Name}}', 'ResponsibleAttorney', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:41:29.667', '2026-11-25 09:41:29.667'),
('40072c54-3c30-4798-9071-a716b6700496', 'ffd84a63-15dd-4736-ac53-3cdf07c061d1', '{{CurrentDate.Long}}', 'CurrentDate', 'long', 0, NULL, 'NONE', NULL, '2026-11-25 09:06:41.631', '2026-11-25 09:06:41.631'),
('40142932-ff19-4b6d-9893-3c4cfc582aee', '1bcd8d6e-d341-40f2-a658-171ab595c104', '{{Attorney.Name}}', 'ResponsibleAttorney', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:42:38.075', '2026-11-25 09:42:38.075'),
('401e26a0-162a-4578-912f-64f4297afa32', 'c4dad4e6-b06d-4b22-acfe-86fcc2611079', '{{Matter.Title}}', 'Matter', 'title', 1, NULL, 'NONE', NULL, '2026-11-25 09:36:07.075', '2026-11-25 09:36:07.075'),
('402b6948-6284-4375-9e4b-7bdc51c2888b', 'f9b4e048-4705-4414-a181-411253453bf6', '{{Matter.MatterNumber}}', 'Matter', 'matterNumber', 1, NULL, 'NONE', NULL, '2026-11-25 09:23:20.542', '2026-11-25 09:23:20.542'),
('40b266dd-7367-4596-89f7-c9af4537e892', '5c4ed245-68df-47de-8fba-a74a422f4820', '{{Attorney.Name}}', 'ResponsibleAttorney', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:08:03.435', '2026-11-25 09:08:03.435'),
('40f8470d-44e3-4baa-9a8f-ba5c4fb24079', 'b2a1dfa2-e833-452c-8130-04e0b55d4a1d', '{{Matter.MatterNumber}}', 'Matter', 'matterNumber', 1, NULL, 'NONE', NULL, '2026-11-25 09:14:52.736', '2026-11-25 09:14:52.736'),
('413483af-8968-4b66-bcbf-8d71565b4551', '0546be74-b575-4c89-9c7e-4dde025b29d8', '{{Matter.MatterNumber}}', 'Matter', 'matterNumber', 1, NULL, 'NONE', NULL, '2026-11-25 09:37:20.927', '2026-11-25 09:37:20.927'),
('4145ad80-bf88-46a6-9d6d-f6abc2d6a0f9', '54999649-7637-42ef-bd53-49354c07f773', '{{Attorney.Name}}', 'ResponsibleAttorney', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:33:38.395', '2026-11-25 09:33:38.395'),
('418cd22f-eedd-42b7-8351-86fc538b9a08', '4bbb16ac-a0c8-4ead-87b5-1d3fd4c9997c', '{{Attorney.Name}}', 'ResponsibleAttorney', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:41:23.875', '2026-11-25 09:41:23.875'),
('41a6c85f-3859-4f4b-b3c2-ffc4c0e1735a', '9ab91dff-b35e-4c69-95a1-880497ac24d3', '{{Incident.AccidentDate}}', 'Incident', 'accidentDate', 0, NULL, 'DATE_LONG', NULL, '2026-11-25 09:21:48.687', '2026-11-25 09:21:48.687'),
('41ad13a1-dc6b-4daa-b5ea-6978f2c958f3', 'a25a6d17-8108-426c-84a8-84dddb0d4e14', '{{Matter.Title}}', 'Matter', 'title', 1, NULL, 'NONE', NULL, '2026-11-25 09:18:08.122', '2026-11-25 09:18:08.122'),
('41fa1815-955c-4596-90b9-ef6b715326f9', '131e2bc8-78b6-49ec-b3e2-835f46fa23ce', '{{Matter.Title}}', 'Matter', 'title', 1, NULL, 'NONE', NULL, '2026-11-25 09:33:24.062', '2026-11-25 09:33:24.062'),
('4234d51a-7ad0-45c1-9979-d869e0ffa314', '226f643a-3838-4870-ace9-92382b262487', '{{Matter.Title}}', 'Matter', 'title', 1, NULL, 'NONE', NULL, '2026-11-25 09:16:13.582', '2026-11-25 09:16:13.582'),
('427e3ea8-bd49-4510-bdec-71dc8d9c643b', '08788e72-5146-48ca-98ce-5982d0d2b77f', '{{Matter.MatterNumber}}', 'Matter', 'matterNumber', 1, NULL, 'NONE', NULL, '2026-11-25 09:32:52.802', '2026-11-25 09:32:52.802'),
('42dd8910-f853-46ac-ba47-c05eddfb64d0', '899c0e12-1011-483a-885a-3dd965fc3a50', '{{Client.Name}}', 'Client', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:44:34.395', '2026-11-25 09:44:34.395'),
('42f4d0f5-fc6d-4013-94c9-13a49b330931', '42179f92-f848-41f2-9b02-33744044ae7a', '{{Matter.MatterNumber}}', 'Matter', 'matterNumber', 1, NULL, 'NONE', NULL, '2026-11-25 09:09:18.012', '2026-11-25 09:09:18.012'),
('42fb723d-9a91-48fd-8f32-0a7bdc35f8e2', 'f1b41b5d-de04-4418-85e1-9788310606e7', '{{Attorney.Name}}', 'ResponsibleAttorney', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:29:24.130', '2026-11-25 09:29:24.130'),
('4343f72f-6785-4ac0-9ee4-b37f90c3eb5b', '624c4276-dd94-475c-b02b-8aadc8109363', '{{Client.Name}}', 'Client', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:27:54.188', '2026-11-25 09:27:54.188'),
('4369cdcb-604a-459f-8b4e-e2a7f3b9298e', 'c436f021-cecd-4c60-9cba-9fc95cea429c', '{{Client.Name}}', 'Client', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:34:36.019', '2026-11-25 09:34:36.019'),
('436b5625-9ce5-4a6e-bc5d-6930dc758f55', '9c13214a-1b1c-4a81-98f5-8e7f02c2bb98', '{{Attorney.Name}}', 'ResponsibleAttorney', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:19:21.787', '2026-11-25 09:19:21.787'),
('436d9679-1cc1-4c9c-b87f-fdbf6ac8c59e', '7589c3cd-fd6c-4337-9606-20bc893e01e2', '{{Attorney.Name}}', 'ResponsibleAttorney', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:32:44.786', '2026-11-25 09:32:44.786'),
('439e7839-58e7-42a5-80a5-98e6da4fce6b', '80fef0d7-db33-4f64-9345-7e456af3165b', '{{Incident.AccidentDate}}', 'Incident', 'accidentDate', 0, NULL, 'DATE_LONG', NULL, '2026-11-25 09:21:23.822', '2026-11-25 09:21:23.822'),
('43a28b88-591b-4119-a9a0-dd1ba8538c18', '3518a797-b578-4ecf-90f0-c21e436d54ed', '{{Matter.Title}}', 'Matter', 'title', 1, NULL, 'NONE', NULL, '2026-11-25 09:16:53.697', '2026-11-25 09:16:53.697'),
('43b2e5da-1da7-4dfd-9ece-c6c741a57aaf', '47eba881-7be9-448c-a110-8e078bcd7706', '{{Matter.Title}}', 'Matter', 'title', 1, NULL, 'NONE', NULL, '2026-11-25 09:31:33.372', '2026-11-25 09:31:33.372'),
('442be0c5-b07f-40f6-83fe-245da1f815fc', '9c13214a-1b1c-4a81-98f5-8e7f02c2bb98', '{{Client.Name}}', 'Client', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:19:21.787', '2026-11-25 09:19:21.787'),
('44602e59-a15a-44d3-927f-96f881f85428', 'd51ef237-53a6-4724-a58f-1620a49a6b25', '{{Matter.Title}}', 'Matter', 'title', 1, NULL, 'NONE', NULL, '2026-11-25 09:20:40.792', '2026-11-25 09:20:40.792'),
('449f71eb-ecce-4ab0-a42d-d9c8ae95ecfb', '375fa418-f38e-4b87-91af-b4da814d3c41', '{{Client.Name}}', 'Client', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:40:07.667', '2026-11-25 09:40:07.667'),
('44abca63-6b35-4ebd-9458-272e317c6525', '40b1c509-16ea-4fb3-b050-c2dc12af9afa', '{{Matter.MatterNumber}}', 'Matter', 'matterNumber', 1, NULL, 'NONE', NULL, '2026-11-25 09:35:59.775', '2026-11-25 09:35:59.775'),
('44cb88ed-8f94-4abd-8a84-dc945b1af443', '0527cd62-fdb7-4653-b0db-0199b267563c', '{{Matter.Title}}', 'Matter', 'title', 1, NULL, 'NONE', NULL, '2026-11-25 09:22:44.662', '2026-11-25 09:22:44.662'),
('455804cf-9cc5-420d-b785-169c051a9448', '8fe19204-74cd-40be-ae84-fbe2a03a3803', '{{Matter.Title}}', 'Matter', 'title', 1, NULL, 'NONE', NULL, '2026-11-25 09:10:19.043', '2026-11-25 09:10:19.043'),
('45932028-6aa1-4004-bf41-9e9591bc542d', '613a6b40-e687-4fef-b6fb-073e8e3bf25a', '{{Attorney.Name}}', 'ResponsibleAttorney', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:38:08.829', '2026-11-25 09:38:08.829'),
('45c88f65-ee1d-4d0c-a57a-3bede5c8fa54', 'f1d31e7b-171b-4abc-85e6-4bfd9332fa65', '{{Attorney.Name}}', 'ResponsibleAttorney', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:35:38.301', '2026-11-25 09:35:38.301'),
('469b713a-5a93-4e75-a0a3-597a0bc2f17d', 'f0166dee-f985-4d9b-b2de-6cfe1f8ad7d3', '{{Client.Name}}', 'Client', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:06:57.490', '2026-11-25 09:06:57.490'),
('46ab577e-1d8e-45b8-a947-6dee1db45c57', '42179f92-f848-41f2-9b02-33744044ae7a', '{{Attorney.Name}}', 'ResponsibleAttorney', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:09:18.012', '2026-11-25 09:09:18.012'),
('46e01729-eeee-4768-afe9-1abc8acf6eea', '85a9dc73-04a9-429c-bea2-9b6c30b6f1b8', '{{Matter.Title}}', 'Matter', 'title', 1, NULL, 'NONE', NULL, '2026-11-25 09:16:06.548', '2026-11-25 09:16:06.548'),
('46f10b67-5c20-4b43-8970-c961835b8111', '228a46fa-e493-4eed-8057-2350df11cfba', 'Client.Address', 'Client', 'address', 0, NULL, 'NONE', NULL, '2026-11-14 09:29:49.029', '2026-11-14 09:29:49.029'),
('4743c88e-3df0-419c-96ad-379be676b554', 'ad50cecb-c9da-4316-8604-9bb9c54fe810', '{{Matter.MatterNumber}}', 'Matter', 'matterNumber', 1, NULL, 'NONE', NULL, '2026-11-25 09:32:36.184', '2026-11-25 09:32:36.184'),
('47a55028-c463-4edd-ad51-d818ef4fb504', 'eb6ab9da-aa7c-44b0-93d2-47e002eefd78', '{{Attorney.Name}}', 'ResponsibleAttorney', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:21:31.807', '2026-11-25 09:21:31.807'),
('47bc9004-3222-494c-8a4e-877b064762d6', '3518a797-b578-4ecf-90f0-c21e436d54ed', '{{Attorney.Name}}', 'ResponsibleAttorney', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:16:53.697', '2026-11-25 09:16:53.697'),
('47c4064a-0666-43fe-be45-f172703eddf2', '3fb28c83-bc70-4ab4-a3d7-b19b4e664c6e', '{{Client.Name}}', 'Client', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:35:30.628', '2026-11-25 09:35:30.628'),
('481822b5-cb5e-4ce9-8ca0-2d156df96aa0', 'c8e2f1fe-5365-44b5-a497-437d71a02c2d', '{{Client.Name}}', 'Client', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:26:22.331', '2026-11-25 09:26:22.331'),
('48732607-e6bb-4c19-947f-41257b34166f', 'd9c65b2f-6e94-46e1-81c0-92616ad8d297', '{{Matter.MatterNumber}}', 'Matter', 'matterNumber', 1, NULL, 'NONE', NULL, '2026-11-25 09:11:06.672', '2026-11-25 09:11:06.672'),
('4885e497-5128-4671-8cb7-4f9fdb8038e1', '328ff179-ebf1-42aa-ad4b-5453495df5ce', '{{Matter.Title}}', 'Matter', 'title', 1, NULL, 'NONE', NULL, '2026-11-25 09:16:33.611', '2026-11-25 09:16:33.611'),
('48888f1b-a3b6-4569-a7d4-673530c4df86', 'fb08ce84-4c18-4837-b721-a23609d55a88', '{{Matter.Title}}', 'Matter', 'title', 1, NULL, 'NONE', NULL, '2026-11-25 09:07:54.843', '2026-11-25 09:07:54.843'),
('48f095c2-3288-4912-9dc2-8b91f2c8ef5a', 'fd5a203a-5e69-48fa-b56e-5f807c102f1f', '{{Matter.Title}}', 'Matter', 'title', 1, NULL, 'NONE', NULL, '2026-11-25 09:22:11.842', '2026-11-25 09:22:11.842'),
('48f48322-6df3-456d-8326-dc968b35e594', 'f1b41b5d-de04-4418-85e1-9788310606e7', '{{Client.Name}}', 'Client', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:29:24.130', '2026-11-25 09:29:24.130'),
('4906eb12-505a-4ab5-ae5b-971c3809a279', '27f73e77-5dbf-4beb-947f-2cac6003fbd8', '{{Matter.Title}}', 'Matter', 'title', 1, NULL, 'NONE', NULL, '2026-11-25 09:12:56.213', '2026-11-25 09:12:56.213'),
('491f6700-bf70-4653-b8f0-448709b0f25a', '02f61270-49a4-46bb-87ec-b6a95478b939', '{{Attorney.Name}}', 'ResponsibleAttorney', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:08:19.002', '2026-11-25 09:08:19.002'),
('4931b539-45f2-4563-9f5f-1a2e73f29f93', '3a87d8d8-132a-4617-8d8d-eab7b162be4a', '{{Attorney.Name}}', 'ResponsibleAttorney', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:29:16.116', '2026-11-25 09:29:16.116'),
('4946e303-ff5c-48f2-9583-315a032167b8', '241fd3a3-0135-4a8b-a617-c23cdff79820', '{{Attorney.Name}}', 'ResponsibleAttorney', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:33:50.854', '2026-11-25 09:33:50.854'),
('49b75b8d-67c1-4733-8afe-aee9381db12a', '711d7253-2ea0-4e60-81b3-fb542fd7c2fa', '{{Attorney.Name}}', 'ResponsibleAttorney', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:13:17.503', '2026-11-25 09:13:17.503'),
('49cc892f-4f46-471f-b080-71cac4981d1f', '9c13214a-1b1c-4a81-98f5-8e7f02c2bb98', '{{Matter.Title}}', 'Matter', 'title', 1, NULL, 'NONE', NULL, '2026-11-25 09:19:21.787', '2026-11-25 09:19:21.787'),
('4a51875f-c6ef-4b1e-a589-296263ba90d2', '177ddea4-9282-497e-b399-6e5e9cf7c4bc', '{{Matter.Title}}', 'Matter', 'title', 1, NULL, 'NONE', NULL, '2026-11-25 09:16:20.040', '2026-11-25 09:16:20.040'),
('4af48883-8b53-4f37-9c7c-a5ccdd3da90e', '5d6da4fd-169a-4e72-a1f3-88e6ab30e6af', '{{Attorney.Name}}', 'ResponsibleAttorney', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:18:40.684', '2026-11-25 09:18:40.684'),
('4af82fa5-8a18-4f27-bccd-37e83f3d27d7', '114c5862-b73f-48ee-a72c-615ed35537b3', '{{CurrentDate.Long}}', 'CurrentDate', 'long', 0, NULL, 'NONE', NULL, '2026-11-25 09:24:04.682', '2026-11-25 09:24:04.682'),
('4b23b201-7003-4f2f-b936-0225e91543b6', '689ca019-7b8a-40f6-8175-1c027a48a5cd', '{{Matter.Title}}', 'Matter', 'title', 1, NULL, 'NONE', NULL, '2026-11-25 09:32:26.150', '2026-11-25 09:32:26.150'),
('4b92241a-8937-4083-a41f-e28282715b7c', '87d1c498-8bb5-43b1-b07b-9b85ff412ce8', '{{Client.Name}}', 'Client', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:33:01.955', '2026-11-25 09:33:01.955'),
('4b959423-d3ab-4a12-a7ed-d5801b82117f', '328ff179-ebf1-42aa-ad4b-5453495df5ce', '{{Client.Name}}', 'Client', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:16:33.611', '2026-11-25 09:16:33.611'),
('4b9647b0-eed8-428c-b298-302939156025', '55c75bd5-de4c-42aa-8bef-cc597dec5070', '{{Matter.Title}}', 'Matter', 'title', 1, NULL, 'NONE', NULL, '2026-11-25 09:40:56.254', '2026-11-25 09:40:56.254'),
('4bce43e1-6315-4c79-acc9-6a837e4d4823', '25ed3bd4-4976-43e6-9a0f-75696cae49f6', '{{Attorney.Name}}', 'ResponsibleAttorney', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:37:34.236', '2026-11-25 09:37:34.236'),
('4be2837f-3d12-4a85-838a-116193b01979', 'eaf9c42d-fa49-4e7f-97e9-106ed7ac79ba', '{{Attorney.Name}}', 'ResponsibleAttorney', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:12:19.440', '2026-11-25 09:12:19.440'),
('4c40ca89-5371-4f92-97b6-4153374e37cf', '7c968a6f-a8ff-49dd-a563-671184d476f0', '{{Client.Name}}', 'Client', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:10:37.449', '2026-11-25 09:10:37.449'),
('4c7513fc-1496-41d0-8dcd-0fd60be69b37', '114c5862-b73f-48ee-a72c-615ed35537b3', '{{Matter.Title}}', 'Matter', 'title', 1, NULL, 'NONE', NULL, '2026-11-25 09:24:04.682', '2026-11-25 09:24:04.682'),
('4cc33218-79df-4804-b235-e3d74134eb6c', '5dc8f9f7-ab83-4e49-bd46-3760dd97a48f', '{{Matter.MatterNumber}}', 'Matter', 'matterNumber', 1, NULL, 'NONE', NULL, '2026-11-25 09:32:01.647', '2026-11-25 09:32:01.647'),
('4cf1d25d-5ca9-40cd-9d41-4dbb30d1dd28', '7589c3cd-fd6c-4337-9606-20bc893e01e2', '{{CurrentDate.Long}}', 'CurrentDate', 'long', 0, NULL, 'NONE', NULL, '2026-11-25 09:32:44.786', '2026-11-25 09:32:44.786'),
('4d5059f8-4a0d-4b36-a67f-ca63bdff81ed', 'e156defb-48fa-424a-9036-9fbb2c624c41', '{{Attorney.Name}}', 'ResponsibleAttorney', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:23:43.289', '2026-11-25 09:23:43.289'),
('4d82d985-15dd-4ed4-ac0d-ced9e52de800', 'aae04ae9-b293-4539-a12a-781f0d71b8d1', '{{Matter.MatterNumber}}', 'Matter', 'matterNumber', 1, NULL, 'NONE', NULL, '2026-11-25 09:13:38.494', '2026-11-25 09:13:38.494'),
('4dc4b321-2112-4c55-a9c3-76daeaac0677', 'd6d12dd8-f5fc-4ea7-947f-a57f919d757f', '{{Matter.MatterNumber}}', 'Matter', 'matterNumber', 1, NULL, 'NONE', NULL, '2026-11-25 09:17:16.922', '2026-11-25 09:17:16.922'),
('4df060fa-c5ef-40e7-849b-cf24649502eb', 'aaadd169-b1e0-4879-acd9-7d4901b33831', '{{Matter.Title}}', 'Matter', 'title', 1, NULL, 'NONE', NULL, '2026-11-25 09:23:06.532', '2026-11-25 09:23:06.532'),
('4e094a1c-ccfd-4d76-a94a-2f3397586df5', '95774654-8970-47c7-98f5-5b016d390ff1', '{{Client.Name}}', 'Client', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:44:07.839', '2026-11-25 09:44:07.839'),
('4e450eb6-a8c7-452e-b6fa-22dcc3e03dac', '17a56c0b-c6dd-4ffe-a43d-9606642e8ed3', '{{Matter.MatterNumber}}', 'Matter', 'matterNumber', 1, NULL, 'NONE', NULL, '2026-11-25 09:23:31.235', '2026-11-25 09:23:31.235'),
('4e9889c0-52f8-4233-bce6-e34f5e278235', '3fb28c83-bc70-4ab4-a3d7-b19b4e664c6e', '{{Matter.Title}}', 'Matter', 'title', 1, NULL, 'NONE', NULL, '2026-11-25 09:35:30.628', '2026-11-25 09:35:30.628'),
('4ea47e75-4711-4854-bcfb-0ae31058c39c', '192fa43c-6472-473c-a04b-d0e469bd25c8', '{{Attorney.Name}}', 'ResponsibleAttorney', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:38:15.749', '2026-11-25 09:38:15.749'),
('4eca8082-3a1d-497a-a556-4137dfd0a802', 'f55f9f4b-1665-4b30-acba-b249d2a03da2', '{{Matter.Title}}', 'Matter', 'title', 1, NULL, 'NONE', NULL, '2026-11-25 09:44:42.548', '2026-11-25 09:44:42.548'),
('4ed2a081-893e-4f8b-a8ed-37094b948775', 'd534334f-ffd5-4c0f-891f-4361aeabdccb', '{{Matter.MatterNumber}}', 'Matter', 'matterNumber', 1, NULL, 'NONE', NULL, '2026-11-25 09:14:29.395', '2026-11-25 09:14:29.395'),
('4ef9280e-bf97-4287-99c9-8ec1c6389da0', '34c7c015-df07-496e-ae4a-c4d9cf030a99', '{{Matter.MatterNumber}}', 'Matter', 'matterNumber', 1, NULL, 'NONE', NULL, '2026-11-25 09:18:50.518', '2026-11-25 09:18:50.518'),
('4f1b0f6b-2061-4036-9271-a812215339ec', '0a100241-1565-4041-8f2b-b25c3d3292a6', '{{Matter.MatterNumber}}', 'Matter', 'matterNumber', 1, NULL, 'NONE', NULL, '2026-11-25 09:11:37.540', '2026-11-25 09:11:37.540'),
('4f1c9400-686c-4f28-9778-0cbd07753eea', '531fb454-bd9a-4435-b96c-e5589881e3cf', '{{Matter.Title}}', 'Matter', 'title', 1, NULL, 'NONE', NULL, '2026-11-25 09:31:18.939', '2026-11-25 09:31:18.939'),
('4f68bb6f-521e-442f-bd3d-e9ec9c9cbb63', '3e010dc9-fa85-4ad9-8a07-540f5b72d1ea', '{{Attorney.Name}}', 'ResponsibleAttorney', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:44:14.592', '2026-11-25 09:44:14.592'),
('4f775ffe-3060-48a5-983f-2798df85dbcd', '06b41a84-824b-4759-b3f2-d49f9828dd05', '{{Client.Name}}', 'Client', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:37:02.335', '2026-11-25 09:37:02.335'),
('4f811e9f-bf7e-4ac5-893c-809c5e6f900c', 'c4dad4e6-b06d-4b22-acfe-86fcc2611079', '{{Attorney.Name}}', 'ResponsibleAttorney', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:36:07.075', '2026-11-25 09:36:07.075'),
('501b259d-4874-40d0-adfc-f120e3bd49a5', 'b2a1dfa2-e833-452c-8130-04e0b55d4a1d', '{{Attorney.Name}}', 'ResponsibleAttorney', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:14:52.736', '2026-11-25 09:14:52.736'),
('5064d9c3-8254-4843-a9e2-6f864bbcb623', '89b37ce7-9d86-4a99-883a-8c5506774e9a', '{{Client.Name}}', 'Client', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:19:44.491', '2026-11-25 09:19:44.491'),
('508b7530-a834-40ad-89f9-0fdd6f90c86c', 'ab0ef57c-1551-4441-b538-de13cf647a2b', '{{Matter.MatterNumber}}', 'Matter', 'matterNumber', 1, NULL, 'NONE', NULL, '2026-11-25 09:08:39.470', '2026-11-25 09:08:39.470'),
('50ac8def-c276-436b-a6ea-1c1b6ffc92a3', '47eba881-7be9-448c-a110-8e078bcd7706', '{{Client.Name}}', 'Client', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:31:33.372', '2026-11-25 09:31:33.372'),
('50f20c8d-5328-4e49-8cee-cae4bceb757d', '3d93dfc7-961e-4026-b271-9ba36c32e208', '{{Matter.Title}}', 'Matter', 'title', 1, NULL, 'NONE', NULL, '2026-11-25 09:09:52.800', '2026-11-25 09:09:52.800'),
('51471453-026a-45dd-96c6-6bc231c850e9', '375fa418-f38e-4b87-91af-b4da814d3c41', '{{Matter.Title}}', 'Matter', 'title', 1, NULL, 'NONE', NULL, '2026-11-25 09:40:07.667', '2026-11-25 09:40:07.667'),
('514826c0-96db-4202-995c-d2bbb86a0e14', '7d717061-8a01-4197-a7ba-9aac4c28051c', '{{Attorney.Name}}', 'ResponsibleAttorney', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:42:22.666', '2026-11-25 09:42:22.666'),
('5185f779-c151-4d38-924b-884b2d861df7', 'a9155966-0259-44c6-b2d3-e443b4534244', '{{CurrentDate.Long}}', 'CurrentDate', 'long', 0, NULL, 'NONE', NULL, '2026-11-25 09:24:18.065', '2026-11-25 09:24:18.065'),
('520301f3-796f-4f5e-8f2a-96370443702b', 'c09cb221-7da0-4fcd-bc6a-15258f26daf1', '{{Attorney.Name}}', 'ResponsibleAttorney', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:43:00.472', '2026-11-25 09:43:00.472'),
('5204f304-55c5-4454-a075-3a69db86e7ed', '497c01fc-7892-4af1-a8db-5950154bb4bc', '{{Client.Name}}', 'Client', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:41:29.667', '2026-11-25 09:41:29.667'),
('52116763-f8db-4ebc-9dde-0d07af66c8c3', '5ba7f4b1-3bfe-41f2-b66a-9d4d563937e2', '{{Insurance.ClaimNumber}}', 'Insurance', 'claimNumber', 0, NULL, 'NONE', NULL, '2026-11-25 09:29:43.089', '2026-11-25 09:29:43.089'),
('52518573-5cfd-4537-b068-8fa577844532', '497c01fc-7892-4af1-a8db-5950154bb4bc', '{{Matter.MatterNumber}}', 'Matter', 'matterNumber', 1, NULL, 'NONE', NULL, '2026-11-25 09:41:29.667', '2026-11-25 09:41:29.667'),
('52ce6b29-296a-44b0-b0f2-9306976c230e', '7e30837a-d454-41ca-9705-e2a4f1ceccf7', '{{Client.Name}}', 'Client', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:43:52.167', '2026-11-25 09:43:52.167'),
('52e77031-d1ec-4cd2-9395-364bd599d02b', '6e739347-97f7-4a33-b95c-78043f9aed05', '{{Attorney.Name}}', 'ResponsibleAttorney', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:19:52.633', '2026-11-25 09:19:52.633'),
('52f35768-8287-4cc9-9afc-79eadea482bb', '0ad99ee2-841e-468d-98b1-a51f2e5b51ee', '{{Matter.Title}}', 'Matter', 'title', 1, NULL, 'NONE', NULL, '2026-11-25 09:21:13.110', '2026-11-25 09:21:13.110'),
('530d55b6-916b-4ed3-9a97-68514e2ce57a', 'ee7a648c-6b21-4a0f-bdc7-1f83084301aa', '{{Matter.Title}}', 'Matter', 'title', 1, NULL, 'NONE', NULL, '2026-11-25 09:24:36.756', '2026-11-25 09:24:36.756'),
('533e978a-0153-4771-96a5-4841d1cfff9f', 'd26b2d0a-875b-440e-bdd0-98d209b395f6', '{{Attorney.Name}}', 'ResponsibleAttorney', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:21:57.086', '2026-11-25 09:21:57.086'),
('534de9ed-960c-43c0-bfe3-de1db4c232c9', 'd37ef01a-3309-47ed-99fd-c75e91b05574', '{{Attorney.Name}}', 'ResponsibleAttorney', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:20:26.060', '2026-11-25 09:20:26.060'),
('53b6afd9-0573-4129-87ef-dbbad238b469', '6cf69812-251b-4c6b-a300-5f54eef3c0c5', '{{Client.Name}}', 'Client', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:26:14.955', '2026-11-25 09:26:14.955'),
('542b7987-e4a3-4bdf-863e-82fbf297aa2d', '38802e64-abb7-4888-9103-69a8af7f72da', '{{Attorney.Name}}', 'ResponsibleAttorney', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:27:34.610', '2026-11-25 09:27:34.610'),
('542c343f-438f-40b9-abf3-d3d5a284740b', '8a3a335c-5720-4c7a-8b84-63dd8464de50', '{{Matter.Title}}', 'Matter', 'title', 1, NULL, 'NONE', NULL, '2026-11-25 09:07:43.776', '2026-11-25 09:07:43.776'),
('543b5d61-e252-4c5c-9406-93c094df0d05', 'f6f0f444-c32f-4188-943b-0ba2dcb10cd4', '{{Matter.Title}}', 'Matter', 'title', 1, NULL, 'NONE', NULL, '2026-11-25 09:34:04.500', '2026-11-25 09:34:04.500'),
('5491c4c2-5991-4c72-be15-d81fb3034a1b', 'b74dc6ca-81f6-4b63-8298-1ef27989924a', '{{Matter.Title}}', 'Matter', 'title', 1, NULL, 'NONE', NULL, '2026-11-25 09:40:28.195', '2026-11-25 09:40:28.195'),
('54a518fd-62b9-447e-a504-b7077bf52cac', '5da49101-918d-4970-8839-06070643f366', '{{MedicalProvider.Name}}', 'MedicalProvider', 'name', 0, NULL, 'NONE', NULL, '2026-11-25 09:24:30.718', '2026-11-25 09:24:30.718'),
('54d0bab8-fb58-4a1a-9f9b-498738291a0b', 'd25581db-9683-4af4-be68-eb539366297e', '{{Matter.MatterNumber}}', 'Matter', 'matterNumber', 1, NULL, 'NONE', NULL, '2026-11-25 09:11:28.516', '2026-11-25 09:11:28.516'),
('54dd4370-ca39-486c-9a9b-bead945602cc', '3fb28c83-bc70-4ab4-a3d7-b19b4e664c6e', '{{Matter.MatterNumber}}', 'Matter', 'matterNumber', 1, NULL, 'NONE', NULL, '2026-11-25 09:35:30.628', '2026-11-25 09:35:30.628'),
('54e5868d-614f-4ee9-89b2-08ed03e1b25a', '5d439c99-f896-4a7f-99e9-3f7c2bf237a9', '{{Matter.MatterNumber}}', 'Matter', 'matterNumber', 1, NULL, 'NONE', NULL, '2026-11-25 09:20:48.401', '2026-11-25 09:20:48.401'),
('55baf814-33b4-489c-96ac-93455d542a07', '60d1ffef-c3d2-4057-9737-b1eae70d5f43', '{{Client.Name}}', 'Client', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:29:31.214', '2026-11-25 09:29:31.214'),
('55d645f6-7cd0-4d65-9041-fbd29ec542aa', 'ee7a648c-6b21-4a0f-bdc7-1f83084301aa', '{{MedicalProvider.Name}}', 'MedicalProvider', 'name', 0, NULL, 'NONE', NULL, '2026-11-25 09:24:36.756', '2026-11-25 09:24:36.756'),
('56b1ff74-1a83-48b1-a066-01d1023bafaa', 'b851d494-c520-40cd-a7be-db993a2ea218', '{{Attorney.Name}}', 'ResponsibleAttorney', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:07:16.221', '2026-11-25 09:07:16.221'),
('56c4e563-404f-4076-8dbd-9455600bbfb7', 'e7b63652-7194-4fd0-923c-6e5cc1cc7975', '{{Matter.MatterNumber}}', 'Matter', 'matterNumber', 1, NULL, 'NONE', NULL, '2026-11-25 09:24:10.646', '2026-11-25 09:24:10.646'),
('56cf19a3-9a89-4d66-a4fd-04d21b99bf22', 'cca756c1-e79e-4d0f-9f90-2b03eac1cbe1', '{{Demand.DemandedAmount}}', 'Demand', 'demandedAmount', 0, NULL, 'CURRENCY_USD', NULL, '2026-11-25 09:13:05.421', '2026-11-25 09:13:05.421'),
('57375e0e-85bd-457b-a6a3-92b71f7e23c2', '1f4de991-5e27-4cca-97fb-d30b56289a97', '{{Matter.MatterNumber}}', 'Matter', 'matterNumber', 1, NULL, 'NONE', NULL, '2026-11-25 09:17:54.539', '2026-11-25 09:17:54.539'),
('57478c08-010c-4f77-b319-dabdd3b76f30', '926f9447-7b92-4349-b757-c0132e4f8be6', '{{Matter.Title}}', 'Matter', 'title', 1, NULL, 'NONE', NULL, '2026-11-25 09:12:29.314', '2026-11-25 09:12:29.314'),
('5779de78-82fa-4674-ae87-498e4a1ca5b2', '3e064705-e7f1-40a4-95c4-ef2c47f0d106', '{{Matter.MatterNumber}}', 'Matter', 'matterNumber', 1, NULL, 'NONE', NULL, '2026-11-25 09:27:15.761', '2026-11-25 09:27:15.761'),
('578a549a-7daa-4994-a406-3c0f29aa2274', '80fef0d7-db33-4f64-9345-7e456af3165b', '{{Insurance.CarrierName}}', 'Insurance', 'insuranceCompany', 0, NULL, 'NONE', NULL, '2026-11-25 09:21:23.822', '2026-11-25 09:21:23.822'),
('57f5c23c-5c5d-4f09-af5a-d22065ebf226', 'd220f2ef-879d-4a4c-baa4-9701c3f16d60', '{{Insurance.ClaimNumber}}', 'Insurance', 'claimNumber', 0, NULL, 'NONE', NULL, '2026-11-25 09:20:32.818', '2026-11-25 09:20:32.818'),
('584750f2-bea5-4a72-a28e-3d21fe1c2d0a', '19b4ea63-d6fe-4c78-a4aa-4e15274d8020', '{{Client.Name}}', 'Client', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:39:14.262', '2026-11-25 09:39:14.262'),
('592d8384-dd67-4973-890d-5d9890981933', '042435a0-f2fb-4811-891e-e9feb57900f1', '{{Matter.Title}}', 'Matter', 'title', 1, NULL, 'NONE', NULL, '2026-11-25 09:25:28.318', '2026-11-25 09:25:28.318'),
('5972ff4b-724b-41b5-a8d7-1b9baefc60a7', 'cca756c1-e79e-4d0f-9f90-2b03eac1cbe1', '{{Matter.Title}}', 'Matter', 'title', 1, NULL, 'NONE', NULL, '2026-11-25 09:13:05.421', '2026-11-25 09:13:05.421'),
('5994d600-bd7d-45e8-a308-83a33f91e95a', 'd554bfda-8bce-4121-a8fa-a94f5da56ba5', 'Insurance.CarrierName', 'Insurance', 'carrierName', 0, NULL, 'NONE', NULL, '2026-11-14 09:29:36.759', '2026-11-14 09:29:36.759'),
('599bf820-9011-4eae-87ca-03858bd52079', 'd220f2ef-879d-4a4c-baa4-9701c3f16d60', '{{Matter.MatterNumber}}', 'Matter', 'matterNumber', 1, NULL, 'NONE', NULL, '2026-11-25 09:20:32.818', '2026-11-25 09:20:32.818'),
('5a09f153-f5c2-41e6-a96f-af05b338d1c3', '5347a9ab-7278-4647-bdd5-13d174237f64', '{{Client.Name}}', 'Client', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:34:29.597', '2026-11-25 09:34:29.597'),
('5a8b92e3-cb86-435b-9026-c546acca9da0', '1c7b9b3b-4466-45fa-994b-f2cc4e40070d', '{{Attorney.Name}}', 'ResponsibleAttorney', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:30:11.806', '2026-11-25 09:30:11.806'),
('5a9b99a6-1d73-4abb-bcf8-c1e538232b41', 'ec1c0e31-fed1-4081-9ec7-c1588deef41e', '{{CurrentDate.Long}}', 'CurrentDate', 'long', 0, NULL, 'NONE', NULL, '2026-11-25 09:35:52.189', '2026-11-25 09:35:52.189'),
('5ababaf9-9795-4d71-8c27-a73196242151', '77fbb573-40db-43ef-b3f6-7856e2272e2e', '{{Insurance.ClaimNumber}}', 'Insurance', 'claimNumber', 0, NULL, 'NONE', NULL, '2026-11-25 09:25:46.767', '2026-11-25 09:25:46.767'),
('5ac56926-2166-4b93-8458-166c67af7929', 'f1de25a4-0c3e-4065-8ed5-d194d16ccebd', '{{Matter.MatterNumber}}', 'Matter', 'matterNumber', 1, NULL, 'NONE', NULL, '2026-11-25 09:18:01.776', '2026-11-25 09:18:01.776'),
('5aea18e2-a42d-476f-a6bb-561656970984', '5f1bd215-9ae3-4d54-abcb-1e3ee92b3623', '{{Attorney.Name}}', 'ResponsibleAttorney', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:39:28.396', '2026-11-25 09:39:28.396'),
('5b9d64ff-81a9-4f8b-ba3f-0aa80f4d01a6', '6d06086f-03a4-44c6-a96d-fc371f6f8967', '{{Matter.Title}}', 'Matter', 'title', 1, NULL, 'NONE', NULL, '2026-11-25 09:44:49.450', '2026-11-25 09:44:49.450'),
('5bb4f415-6a2e-4f9a-9af0-a824640cf8c1', '4226ca5b-e6e1-45d7-9cee-96843614940c', '{{Client.Name}}', 'Client', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:14:03.120', '2026-11-25 09:14:03.120'),
('5bca92c9-266b-4051-b89a-3110b746de02', '3f0f23bb-0dd8-403d-ae37-f520c2cf7c4c', '{{Court.Name}}', 'Court', 'name', 0, NULL, 'NONE', NULL, '2026-11-25 09:13:30.201', '2026-11-25 09:13:30.201'),
('5c07ead6-c569-4f9e-ad80-19950f7e42cb', 'b3795800-cd6e-4e96-84d4-f31e28eaab0f', '{{Attorney.Name}}', 'ResponsibleAttorney', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:27:22.513', '2026-11-25 09:27:22.513'),
('5c8126c4-50dc-406a-81f4-1801e579948d', 'c2303872-a179-4c73-93f2-941c4abcbc6d', '{{Attorney.Name}}', 'ResponsibleAttorney', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:24:55.871', '2026-11-25 09:24:55.871'),
('5cdba6d5-2fa0-44ff-817a-b363328b35d9', '6cf69812-251b-4c6b-a300-5f54eef3c0c5', '{{Attorney.Name}}', 'ResponsibleAttorney', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:26:14.955', '2026-11-25 09:26:14.955'),
('5cef00f2-5928-494e-bc28-d758bbce24da', '63f83669-73d7-4103-8985-2988d5f0bd36', '{{Client.Name}}', 'Client', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:28:47.493', '2026-11-25 09:28:47.493');
INSERT INTO `document_field_mappings` (`id`, `template_version_id`, `placeholder_tag`, `source_entity`, `source_field`, `is_required`, `default_value`, `formatting_rule`, `conditional_expression`, `created_at`, `updated_at`) VALUES
('5cf9f445-e0a5-4ec0-9e67-f0b1b8cd70b1', '6d06086f-03a4-44c6-a96d-fc371f6f8967', '{{Matter.MatterNumber}}', 'Matter', 'matterNumber', 1, NULL, 'NONE', NULL, '2026-11-25 09:44:49.450', '2026-11-25 09:44:49.450'),
('5d14b325-1741-4c7b-b917-51ad37e87d17', '5da49101-918d-4970-8839-06070643f366', '{{Matter.Title}}', 'Matter', 'title', 1, NULL, 'NONE', NULL, '2026-11-25 09:24:30.718', '2026-11-25 09:24:30.718'),
('5d2c9c56-9796-401c-825c-54690b2c6e8d', '58ec5cad-437f-4a3c-8985-2768faed1166', '{{Matter.Title}}', 'Matter', 'title', 1, NULL, 'NONE', NULL, '2026-11-25 09:34:59.842', '2026-11-25 09:34:59.842'),
('5e007f48-4c26-4e14-82c3-08cc23e4d985', 'c69600cd-b146-4522-aa83-5b71a475f133', '{{Matter.MatterNumber}}', 'Matter', 'matterNumber', 1, NULL, 'NONE', NULL, '2026-11-25 09:25:03.045', '2026-11-25 09:25:03.045'),
('5eb118af-9e94-457d-a80a-b09180749936', '77fcdc30-31b1-4157-a660-84554edc5518', '{{Insurance.ClaimNumber}}', 'Insurance', 'claimNumber', 0, NULL, 'NONE', NULL, '2026-11-25 09:20:17.652', '2026-11-25 09:20:17.652'),
('5eb3fea0-e7f2-4d93-928a-7e3eb1acb81e', '684d2593-9a02-43e0-8595-0167ccf0ccc7', '{{Client.Name}}', 'Client', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:15:45.512', '2026-11-25 09:15:45.512'),
('5eb44cae-dba8-4148-86c7-b1f04d364a0e', 'd26b2d0a-875b-440e-bdd0-98d209b395f6', '{{Matter.Title}}', 'Matter', 'title', 1, NULL, 'NONE', NULL, '2026-11-25 09:21:57.086', '2026-11-25 09:21:57.086'),
('5ed988e4-be7d-42c1-9186-ed8cc1e12511', '226f643a-3838-4870-ace9-92382b262487', '{{Matter.MatterNumber}}', 'Matter', 'matterNumber', 1, NULL, 'NONE', NULL, '2026-11-25 09:16:13.582', '2026-11-25 09:16:13.582'),
('5f0472a8-cd0c-4cd2-9466-ce317c5344cf', 'd51ef237-53a6-4724-a58f-1620a49a6b25', '{{Matter.MatterNumber}}', 'Matter', 'matterNumber', 1, NULL, 'NONE', NULL, '2026-11-25 09:20:40.792', '2026-11-25 09:20:40.792'),
('5f1c8424-9d5d-4faa-b659-0c13f197f8d2', '7d717061-8a01-4197-a7ba-9aac4c28051c', '{{Client.Name}}', 'Client', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:42:22.666', '2026-11-25 09:42:22.666'),
('5f4cb4b6-1568-479c-b176-c1bff50e5354', '6cd5cc86-0fd6-4dbe-b6a2-9ec56b0b5d54', '{{Matter.MatterNumber}}', 'Matter', 'matterNumber', 1, NULL, 'NONE', NULL, '2026-11-25 09:12:09.936', '2026-11-25 09:12:09.936'),
('5f5b3465-87b1-49c4-8be9-440a943eef52', 'c1df0c28-85dc-454d-a4b5-8cfa6b73fdae', '{{Matter.MatterNumber}}', 'Matter', 'matterNumber', 1, NULL, 'NONE', NULL, '2026-11-25 09:39:35.618', '2026-11-25 09:39:35.618'),
('5f7b41d8-35bc-46f9-84d7-1cc4e330ba4c', 'ef31a912-5c20-4e9e-b072-8a9062cf43b5', '{{Attorney.Name}}', 'ResponsibleAttorney', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:31:52.621', '2026-11-25 09:31:52.621'),
('5f97d582-17b3-4097-9cc6-f069953abd51', '5a981617-df0e-4bdb-82f9-9d15d3011053', '{{Client.Name}}', 'Client', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:42:08.360', '2026-11-25 09:42:08.360'),
('5fa8b744-9fe6-4558-86e5-908e7cc6b665', '328ff179-ebf1-42aa-ad4b-5453495df5ce', '{{Matter.MatterNumber}}', 'Matter', 'matterNumber', 1, NULL, 'NONE', NULL, '2026-11-25 09:16:33.611', '2026-11-25 09:16:33.611'),
('6015d051-b61f-4529-b5f6-2bc734f96b81', 'f5baa4d4-c567-40bb-a6da-9bc4cd478cb2', '{{Client.Name}}', 'Client', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:30:20.873', '2026-11-25 09:30:20.873'),
('60183e2f-2775-4b53-885f-b4dd0eb1fc4a', 'c69600cd-b146-4522-aa83-5b71a475f133', '{{Attorney.Name}}', 'ResponsibleAttorney', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:25:03.045', '2026-11-25 09:25:03.045'),
('60265131-a8d5-4351-9b98-c091ca73c303', '4bc4828e-f99f-4897-9448-cd2ad8e39c37', '{{Client.Name}}', 'Client', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:45:03.790', '2026-11-25 09:45:03.790'),
('60a085bc-ab4c-4984-bbba-a83015eca602', '73efedfc-9f48-4cbe-960a-523e0de00400', '{{Attorney.Name}}', 'ResponsibleAttorney', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:21:03.947', '2026-11-25 09:21:03.947'),
('6106cd55-da2c-48b8-828a-4dca37b29389', 'd795264a-186b-4ff7-90ce-a6483dbb71ee', '{{Attorney.Name}}', 'ResponsibleAttorney', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:42:01.887', '2026-11-25 09:42:01.887'),
('61242a3a-2374-4ce1-a078-2631e153b30a', 'fd5a203a-5e69-48fa-b56e-5f807c102f1f', '{{Matter.MatterNumber}}', 'Matter', 'matterNumber', 1, NULL, 'NONE', NULL, '2026-11-25 09:22:11.842', '2026-11-25 09:22:11.842'),
('61eeb467-21bb-4693-922f-f1bdd79bb156', '7402b6b9-9787-4ceb-8664-88ca07ac3156', '{{Client.Name}}', 'Client', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:23:50.365', '2026-11-25 09:23:50.365'),
('61fe66ae-f29d-401f-a5c9-c6c9cea3a9c5', '3d18b45d-4569-4168-be21-a212ad7882bf', '{{Matter.Title}}', 'Matter', 'title', 1, NULL, 'NONE', NULL, '2026-11-25 09:36:27.490', '2026-11-25 09:36:27.490'),
('62272d33-f035-4cdb-a963-a01890d0a609', '5dc8f9f7-ab83-4e49-bd46-3760dd97a48f', '{{Matter.Title}}', 'Matter', 'title', 1, NULL, 'NONE', NULL, '2026-11-25 09:32:01.647', '2026-11-25 09:32:01.647'),
('6230ace3-f548-4d67-9b34-06695d456dbd', 'a5c5977b-441a-4ccb-b7f1-085ce2ccc18f', '{{Matter.Title}}', 'Matter', 'title', 1, NULL, 'NONE', NULL, '2026-11-25 09:28:35.656', '2026-11-25 09:28:35.656'),
('6279e8de-0282-4914-9bd6-93507c8dbc93', 'df3e25c5-5690-4157-99b0-8313f33d326b', '{{Matter.Title}}', 'Matter', 'title', 1, NULL, 'NONE', NULL, '2026-11-25 09:22:27.806', '2026-11-25 09:22:27.806'),
('6282bd3c-cd3e-43de-a3d7-c1346e8bec3d', '25cda274-07df-4c65-88da-f1ff8e45e0dd', '{{Matter.Title}}', 'Matter', 'title', 1, NULL, 'NONE', NULL, '2026-11-25 09:22:36.613', '2026-11-25 09:22:36.613'),
('6285bdd6-1d42-4afc-adb7-0c9759203159', '84b6150f-c07b-449b-bc21-dc242056935f', '{{Attorney.Name}}', 'ResponsibleAttorney', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:30:44.324', '2026-11-25 09:30:44.324'),
('62aa5c65-e571-4c7d-a6c7-81a2eb91cee5', '23677d2e-5004-42ab-9cf0-46261d6258e5', '{{Attorney.Name}}', 'ResponsibleAttorney', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:40:34.614', '2026-11-25 09:40:34.614'),
('62c713d9-3012-4267-9c67-e0249e14ff99', '2f5620bd-ff68-4eda-8b79-fe8f49ae40db', '{{Matter.MatterNumber}}', 'Matter', 'matterNumber', 1, NULL, 'NONE', NULL, '2026-11-25 09:34:22.712', '2026-11-25 09:34:22.712'),
('62da9e65-3e21-4f81-920e-e4659dd96f8d', '92773fd1-905b-4407-8351-96a284175b55', '{{Client.Name}}', 'Client', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:25:52.825', '2026-11-25 09:25:52.825'),
('63613f33-42b8-437f-876a-65359339f621', '50a5e530-ac91-4503-a883-e3f98ebcb26a', '{{Matter.MatterNumber}}', 'Matter', 'matterNumber', 1, NULL, 'NONE', NULL, '2026-11-25 09:16:46.597', '2026-11-25 09:16:46.597'),
('63dd43ef-fd9c-4985-aea0-939a1f75f68b', '1287a3a4-02d3-4c40-85a0-194b36a3e598', '{{Incident.AccidentDate}}', 'Incident', 'accidentDate', 0, NULL, 'DATE_LONG', NULL, '2026-11-25 09:20:55.585', '2026-11-25 09:20:55.585'),
('64592f97-1996-4d4b-92f8-28ed8f7ac61f', '89b37ce7-9d86-4a99-883a-8c5506774e9a', '{{Matter.Title}}', 'Matter', 'title', 1, NULL, 'NONE', NULL, '2026-11-25 09:19:44.491', '2026-11-25 09:19:44.491'),
('64626ae1-2d49-45ef-ac0d-e3de1f6d5b04', 'b0f8af6b-e459-46d0-849b-c7d88fc13633', '{{Client.Name}}', 'Client', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:24:45.504', '2026-11-25 09:24:45.504'),
('64c903ba-5332-4981-bff3-ff291811a1d9', '05d6bd45-cbbf-4e86-852e-fac15162a534', '{{Matter.Title}}', 'Matter', 'title', 1, NULL, 'NONE', NULL, '2026-11-25 09:42:45.141', '2026-11-25 09:42:45.141'),
('64da8a55-d51f-44ff-942e-6f363ac17473', 'ef31a912-5c20-4e9e-b072-8a9062cf43b5', '{{Client.Name}}', 'Client', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:31:52.621', '2026-11-25 09:31:52.621'),
('64e68b37-c2d8-4fd2-a675-975bfc22c1fd', '3d18b45d-4569-4168-be21-a212ad7882bf', '{{Attorney.Name}}', 'ResponsibleAttorney', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:36:27.490', '2026-11-25 09:36:27.490'),
('65074dd3-f0f4-4bf4-ae09-26319dc22130', '8a3a335c-5720-4c7a-8b84-63dd8464de50', '{{Client.Name}}', 'Client', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:07:43.776', '2026-11-25 09:07:43.776'),
('654fc7d4-f86f-4bf4-9110-bf9ff2517668', 'a9155966-0259-44c6-b2d3-e443b4534244', '{{Matter.MatterNumber}}', 'Matter', 'matterNumber', 1, NULL, 'NONE', NULL, '2026-11-25 09:24:18.065', '2026-11-25 09:24:18.065'),
('656519c9-1653-466d-ac62-c067af6321b0', '2921473b-3172-4a76-9567-4533d18df0a9', '{{Attorney.Name}}', 'ResponsibleAttorney', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:18:33.651', '2026-11-25 09:18:33.651'),
('65af00d6-fe8f-4ec9-8db3-94bdc5e4cf16', '05e48612-750f-40cb-b0e5-13058702e7aa', '{{Matter.Title}}', 'Matter', 'title', 1, NULL, 'NONE', NULL, '2026-11-25 09:08:12.860', '2026-11-25 09:08:12.860'),
('65b21ff2-5ba3-48e0-b7ad-789f8e72de1d', '836e1674-9f3e-4b15-bbdf-71e9f39cf358', '{{Client.Name}}', 'Client', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:22:21.046', '2026-11-25 09:22:21.046'),
('662c5370-7e5b-4107-93fd-f5bdc90cc94a', '33c3b86e-3b0c-4b3a-a5f3-15a26b0395d5', '{{Matter.MatterNumber}}', 'Matter', 'matterNumber', 1, NULL, 'NONE', NULL, '2026-11-25 09:13:55.497', '2026-11-25 09:13:55.497'),
('66f32d88-4d74-4ed5-8383-6cc7071d0f3a', '600309b1-9409-492e-8115-f1cadcf4a2d4', '{{Attorney.Name}}', 'ResponsibleAttorney', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:25:34.746', '2026-11-25 09:25:34.746'),
('671772de-43c8-494f-8a9f-215ee6fbbb1e', '94dfbc9b-cc38-442f-801b-f9c7ffc02668', '{{CurrentDate.Long}}', 'CurrentDate', 'long', 0, NULL, 'NONE', NULL, '2026-11-25 09:17:48.644', '2026-11-25 09:17:48.644'),
('672007e2-7059-4e14-a26b-db659745d051', '6cd5cc86-0fd6-4dbe-b6a2-9ec56b0b5d54', '{{Client.Name}}', 'Client', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:12:09.936', '2026-11-25 09:12:09.936'),
('673e42be-fd98-4fde-a814-8b9f2c612014', 'f9b4e048-4705-4414-a181-411253453bf6', '{{Attorney.Name}}', 'ResponsibleAttorney', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:23:20.542', '2026-11-25 09:23:20.542'),
('676e9253-b3bc-4e29-be6c-6917db43f061', '0015843c-7e56-4ddd-8825-b5d85bc450df', '{{Matter.MatterNumber}}', 'Matter', 'matterNumber', 1, NULL, 'NONE', NULL, '2026-11-25 09:26:37.754', '2026-11-25 09:26:37.754'),
('6772d9ca-aeb2-4443-905b-d69262532ec8', '50a5e530-ac91-4503-a883-e3f98ebcb26a', '{{Attorney.Name}}', 'ResponsibleAttorney', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:16:46.597', '2026-11-25 09:16:46.597'),
('67bd15c1-a028-48f0-9570-e0741c0bf64e', '457c84fb-c3d9-485b-8f89-ed18a04371b7', '{{Matter.Title}}', 'Matter', 'title', 1, NULL, 'NONE', NULL, '2026-11-25 09:19:11.121', '2026-11-25 09:19:11.121'),
('67c478a8-62a0-45fd-b58d-0e00c85544d1', '4a08e886-9403-4d5f-8cf6-8666d9bad508', '{{Client.Name}}', 'Client', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:39:55.755', '2026-11-25 09:39:55.755'),
('67ce6e2c-643f-427e-83fc-812c5a058a99', '941ada6d-d6b6-4a4e-aef6-310034619304', '{{Attorney.Name}}', 'ResponsibleAttorney', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:40:01.513', '2026-11-25 09:40:01.513'),
('683f2c6d-0561-478a-93c6-4d8e31e93c61', '08788e72-5146-48ca-98ce-5982d0d2b77f', '{{Client.Name}}', 'Client', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:32:52.802', '2026-11-25 09:32:52.802'),
('686b7f08-7007-455e-a6b0-2a11d950d642', '2c0605e3-233d-47b9-b595-5dc7dedf36a1', '{{Client.Name}}', 'Client', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:39:01.771', '2026-11-25 09:39:01.771'),
('68a59c05-6bb2-4a64-a789-3a94aa782be5', '80fef0d7-db33-4f64-9345-7e456af3165b', '{{Client.Name}}', 'Client', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:21:23.822', '2026-11-25 09:21:23.822'),
('68a5acb7-a904-4612-8c8b-3ec138db2abe', '3bbc2c93-4f93-48e7-828d-2a34553167e2', '{{Attorney.Name}}', 'ResponsibleAttorney', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:16:01.257', '2026-11-25 09:16:01.257'),
('690b157e-f2e0-4145-bb14-5b6c77d8bd5a', 'f1ae8218-aa51-4131-8ef6-0c719f6c8747', '{{Attorney.Name}}', 'ResponsibleAttorney', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:13:47.034', '2026-11-25 09:13:47.034'),
('6920a6e0-1202-4b29-80c7-7b1d260d04ab', 'bdbbe799-0966-4ffc-8c57-858e9721bb25', '{{Attorney.Name}}', 'ResponsibleAttorney', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:14:22.018', '2026-11-25 09:14:22.018'),
('6930619c-d7f0-4c47-85d7-a9fe90ebcf84', 'bfca17de-bbd6-4c08-92f0-3f99bfb54785', '{{Client.Name}}', 'Client', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:39:47.060', '2026-11-25 09:39:47.060'),
('694dd575-4510-4a2f-8b5e-6df03141bc85', '89bfc8b5-afc6-4a24-a9fd-f558824dc2c7', '{{Matter.MatterNumber}}', 'Matter', 'matterNumber', 1, NULL, 'NONE', NULL, '2026-11-25 09:38:43.357', '2026-11-25 09:38:43.357'),
('695de6ca-9e23-4c0d-8f8d-ea25f734cd8b', '684d2593-9a02-43e0-8595-0167ccf0ccc7', '{{Attorney.Name}}', 'ResponsibleAttorney', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:15:45.512', '2026-11-25 09:15:45.512'),
('6966230c-9ff0-416d-8dd2-7b51750956ff', '23677d2e-5004-42ab-9cf0-46261d6258e5', '{{Matter.MatterNumber}}', 'Matter', 'matterNumber', 1, NULL, 'NONE', NULL, '2026-11-25 09:40:34.614', '2026-11-25 09:40:34.614'),
('69a10464-3b1e-4eb8-98da-e6cd159f83db', 'eaf9c42d-fa49-4e7f-97e9-106ed7ac79ba', '{{Matter.MatterNumber}}', 'Matter', 'matterNumber', 1, NULL, 'NONE', NULL, '2026-11-25 09:12:19.440', '2026-11-25 09:12:19.440'),
('69c2494f-fc3a-450b-8fb4-1c455153056b', '6c598600-36e9-4b4d-a4b8-af354c65699e', '{{Attorney.Name}}', 'ResponsibleAttorney', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:34:16.928', '2026-11-25 09:34:16.928'),
('69ccefff-7510-4238-b216-3f67bd296735', '76395bd0-02c0-43be-8bbc-63a75e09d00d', '{{Client.Name}}', 'Client', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:12:48.006', '2026-11-25 09:12:48.006'),
('69ddc570-78bb-43a4-be16-6d712fe21806', '375fa418-f38e-4b87-91af-b4da814d3c41', '{{Attorney.Name}}', 'ResponsibleAttorney', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:40:07.667', '2026-11-25 09:40:07.667'),
('69e870fd-603d-4e30-a2a3-8f0d8969452e', 'c74c8d8a-da5f-45a1-b4d9-37382fa0edc7', '{{Insurance.ClaimNumber}}', 'Insurance', 'claimNumber', 0, NULL, 'NONE', NULL, '2026-11-25 09:07:28.820', '2026-11-25 09:07:28.820'),
('69fb1434-a6a4-49d7-bfc9-f4edf8504df5', '177ddea4-9282-497e-b399-6e5e9cf7c4bc', '{{Attorney.Name}}', 'ResponsibleAttorney', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:16:20.040', '2026-11-25 09:16:20.040'),
('6a572e16-53f8-4e2f-a280-29ab320f996f', 'd25581db-9683-4af4-be68-eb539366297e', '{{Client.Name}}', 'Client', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:11:28.516', '2026-11-25 09:11:28.516'),
('6a5c49fe-c8ff-40a2-908d-1fb4c242c1de', '4f9a81a9-9252-4774-9e0a-dd01e6c80ac9', '{{Matter.MatterNumber}}', 'Matter', 'matterNumber', 1, NULL, 'NONE', NULL, '2026-11-25 09:11:54.187', '2026-11-25 09:11:54.187'),
('6a7d860a-8dd5-4bd3-b305-89aa79579227', '5d6da4fd-169a-4e72-a1f3-88e6ab30e6af', '{{Matter.MatterNumber}}', 'Matter', 'matterNumber', 1, NULL, 'NONE', NULL, '2026-11-25 09:18:40.684', '2026-11-25 09:18:40.684'),
('6a9b1948-7413-4a55-a1f1-7974333aab91', 'd9c65b2f-6e94-46e1-81c0-92616ad8d297', '{{Attorney.Name}}', 'ResponsibleAttorney', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:11:06.672', '2026-11-25 09:11:06.672'),
('6b178ee1-635d-4c46-9529-8d4b9c3ffcd2', '06b41a84-824b-4759-b3f2-d49f9828dd05', '{{Matter.Title}}', 'Matter', 'title', 1, NULL, 'NONE', NULL, '2026-11-25 09:37:02.335', '2026-11-25 09:37:02.335'),
('6b4b3ebd-44e0-484c-bc04-1b9b752771a4', 'df3e25c5-5690-4157-99b0-8313f33d326b', '{{Incident.AccidentDate}}', 'Incident', 'accidentDate', 0, NULL, 'DATE_LONG', NULL, '2026-11-25 09:22:27.806', '2026-11-25 09:22:27.806'),
('6b65916e-0701-499d-a290-f98ef56b1a44', 'f3c5d700-e6d6-4bf5-ab31-1e450d09a991', '{{Matter.Title}}', 'Matter', 'title', 1, NULL, 'NONE', NULL, '2026-11-25 09:18:14.290', '2026-11-25 09:18:14.290'),
('6b718633-dc9f-4866-8b4d-46ce9585b56b', '58cfe8c5-ef3d-4a4a-b367-577985a01b75', 'Matter.MatterNumber', 'Matter', 'matterNumber', 1, NULL, 'NONE', NULL, '2026-11-14 09:29:43.932', '2026-11-14 09:29:43.932'),
('6b88d120-1aed-4039-b39b-27e61ceff5d2', '131e2bc8-78b6-49ec-b3e2-835f46fa23ce', '{{Matter.MatterNumber}}', 'Matter', 'matterNumber', 1, NULL, 'NONE', NULL, '2026-11-25 09:33:24.062', '2026-11-25 09:33:24.062'),
('6bad4714-7e27-4d4a-b7f7-7258f2ec51d6', 'fd5a203a-5e69-48fa-b56e-5f807c102f1f', '{{Attorney.Name}}', 'ResponsibleAttorney', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:22:11.842', '2026-11-25 09:22:11.842'),
('6bb83a46-d284-43b6-8402-4516f2aab9dc', '531fb454-bd9a-4435-b96c-e5589881e3cf', '{{Insurance.ClaimNumber}}', 'Insurance', 'claimNumber', 0, NULL, 'NONE', NULL, '2026-11-25 09:31:18.939', '2026-11-25 09:31:18.939'),
('6bd8b0fa-3ac0-46e6-a53c-c3f32994c1ff', 'cc5d287b-035c-4bbb-8ad8-7cc0051ffb46', '{{Attorney.Name}}', 'ResponsibleAttorney', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:30:52.249', '2026-11-25 09:30:52.249'),
('6c3e4157-58f8-42b7-b362-643668616466', 'c59cf2fd-2725-4f2d-ad2c-f2023addff3e', '{{Attorney.Name}}', 'ResponsibleAttorney', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:43:34.906', '2026-11-25 09:43:34.906'),
('6c6815aa-a4c9-412a-9d05-4ccc2d9e0cd3', '3dcceccc-1e07-4dd6-8f21-e7a09f064265', '{{CurrentDate.Long}}', 'CurrentDate', 'long', 0, NULL, 'NONE', NULL, '2026-11-25 09:12:01.509', '2026-11-25 09:12:01.509'),
('6c9a9e44-0cd3-4b2e-93e0-66e14ff5edd5', '689ca019-7b8a-40f6-8175-1c027a48a5cd', '{{Client.Name}}', 'Client', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:32:26.150', '2026-11-25 09:32:26.150'),
('6cbcc461-51f3-4d74-83a9-753aa5a225df', '54999649-7637-42ef-bd53-49354c07f773', '{{Client.Name}}', 'Client', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:33:38.395', '2026-11-25 09:33:38.395'),
('6d0c6c7f-04b4-4027-946a-9e64e5a7159c', 'eaf9c42d-fa49-4e7f-97e9-106ed7ac79ba', '{{Client.Name}}', 'Client', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:12:19.440', '2026-11-25 09:12:19.440'),
('6d264270-4542-40d6-9928-de88cc35c3a6', '7619287d-b2b5-4020-a2f8-af71d2726f35', '{{Matter.MatterNumber}}', 'Matter', 'matterNumber', 1, NULL, 'NONE', NULL, '2026-11-25 09:45:28.746', '2026-11-25 09:45:28.746'),
('6d4e499c-4247-45da-9310-e7acde4518d2', '3e0af65d-626c-4468-8b9b-6b10b044165b', '{{Client.Name}}', 'Client', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:16:39.847', '2026-11-25 09:16:39.847'),
('6d5cb856-79ba-40ec-9938-406dfc1e39da', '0ad99ee2-841e-468d-98b1-a51f2e5b51ee', '{{CurrentDate.Long}}', 'CurrentDate', 'long', 0, NULL, 'NONE', NULL, '2026-11-25 09:21:13.110', '2026-11-25 09:21:13.110'),
('6d6bcf27-00ea-49cb-bf75-dfd88030388f', 'fe7b7db2-ab5b-4c22-bbd9-6c48fb296c01', '{{Client.Name}}', 'Client', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:25:15.933', '2026-11-25 09:25:15.933'),
('6d716205-4bea-440d-bbdc-2059d1e1bfe6', 'f57ee915-26c8-4404-b8af-6a03e2a7cb59', '{{Client.Name}}', 'Client', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:40:41.743', '2026-11-25 09:40:41.743'),
('6dc2150b-3426-490b-8ce0-d4e973232058', '53bc3d46-cfba-4978-aced-36898c7f25bd', '{{Matter.MatterNumber}}', 'Matter', 'matterNumber', 1, NULL, 'NONE', NULL, '2026-11-25 09:33:30.964', '2026-11-25 09:33:30.964'),
('6df008c7-d6f4-40b8-8c9d-ce75b1e6aedc', 'd4dbbe74-9882-4019-a375-d6771172c7ce', '{{Matter.Title}}', 'Matter', 'title', 1, NULL, 'NONE', NULL, '2026-11-25 09:26:44.761', '2026-11-25 09:26:44.761'),
('6dfe01f5-4a63-4052-a218-191d7496239f', '9f876323-e455-4913-9232-d561ae223b81', '{{Court.Name}}', 'Court', 'name', 0, NULL, 'NONE', NULL, '2026-11-25 09:36:49.099', '2026-11-25 09:36:49.099'),
('6e360519-cfd2-46ca-9e03-470626008ca0', '61ce7918-34d9-4ca7-955c-4fc895d710ef', '{{Matter.MatterNumber}}', 'Matter', 'matterNumber', 1, NULL, 'NONE', NULL, '2026-11-25 09:14:11.412', '2026-11-25 09:14:11.412'),
('6e6a9135-a0fe-4bef-9c9a-72f85baeec1a', '24be09a7-7d8c-4d14-a6ad-4438cf0d12d8', '{{Insurance.ClaimNumber}}', 'Insurance', 'claimNumber', 0, NULL, 'NONE', NULL, '2026-11-25 09:28:22.849', '2026-11-25 09:28:22.849'),
('6ea1f1cb-fc0d-4154-9ebc-225e52928c3f', 'f55f9f4b-1665-4b30-acba-b249d2a03da2', '{{Matter.MatterNumber}}', 'Matter', 'matterNumber', 1, NULL, 'NONE', NULL, '2026-11-25 09:44:42.548', '2026-11-25 09:44:42.548'),
('6eb391aa-1902-43cb-a207-de4f12505150', '941ada6d-d6b6-4a4e-aef6-310034619304', '{{Client.Name}}', 'Client', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:40:01.513', '2026-11-25 09:40:01.513'),
('6ec2d059-eda1-4d59-be2b-370c55122e09', '05e48612-750f-40cb-b0e5-13058702e7aa', '{{Matter.MatterNumber}}', 'Matter', 'matterNumber', 1, NULL, 'NONE', NULL, '2026-11-25 09:08:12.860', '2026-11-25 09:08:12.860'),
('6eddf540-ba5f-43f5-a567-99de587353e4', 'dd990efc-d55c-4258-9f99-222b61fea6f9', '{{Client.Name}}', 'Client', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:10:27.131', '2026-11-25 09:10:27.131'),
('6f1867b9-d99a-4631-8fff-db4e58e90319', '9024acc9-4c92-4c96-b980-7c11389d10a9', '{{Attorney.Name}}', 'ResponsibleAttorney', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:38:02.180', '2026-11-25 09:38:02.180'),
('6f2d6dce-4333-4a8c-902a-3a587e570804', '17a56c0b-c6dd-4ffe-a43d-9606642e8ed3', '{{Attorney.Name}}', 'ResponsibleAttorney', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:23:31.235', '2026-11-25 09:23:31.235'),
('6f8104f0-decd-49ab-b224-c821687a9159', 'fdcaea3e-57f2-40dd-ad96-ec8882510a85', '{{Client.Name}}', 'Client', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:29:08.687', '2026-11-25 09:29:08.687'),
('6ffd9827-7094-4c9e-a0eb-a7874477ff64', 'c59cf2fd-2725-4f2d-ad2c-f2023addff3e', '{{Matter.Title}}', 'Matter', 'title', 1, NULL, 'NONE', NULL, '2026-11-25 09:43:34.906', '2026-11-25 09:43:34.906'),
('7045adae-e86f-4078-8954-d66ff4e227c3', 'f1b41b5d-de04-4418-85e1-9788310606e7', '{{Matter.Title}}', 'Matter', 'title', 1, NULL, 'NONE', NULL, '2026-11-25 09:29:24.130', '2026-11-25 09:29:24.130'),
('708a3507-9682-40cd-ac47-e51ff66fe977', '5c4ed245-68df-47de-8fba-a74a422f4820', '{{Matter.Title}}', 'Matter', 'title', 1, NULL, 'NONE', NULL, '2026-11-25 09:08:03.435', '2026-11-25 09:08:03.435'),
('708c890a-a509-49e3-bd4a-b3e37564af5e', '02dd54d6-98d0-413c-8b37-8b1dd6a1369d', '{{Matter.MatterNumber}}', 'Matter', 'matterNumber', 1, NULL, 'NONE', NULL, '2026-11-25 09:44:21.971', '2026-11-25 09:44:21.971'),
('70c17314-f153-48f4-ba81-8b44b55bb2e9', 'b34abf61-fe95-49b8-810d-c4aca66effd6', '{{Matter.Title}}', 'Matter', 'title', 1, NULL, 'NONE', NULL, '2026-11-25 09:34:49.041', '2026-11-25 09:34:49.041'),
('71e7a22f-3dbd-495b-b71e-cb67d6fcbec3', 'a0952cf1-1670-4189-8513-382751260037', '{{Client.Name}}', 'Client', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:43:07.970', '2026-11-25 09:43:07.970'),
('72374f8e-853d-4e25-aea6-b6b54fa4d005', 'a9155966-0259-44c6-b2d3-e443b4534244', '{{Client.Name}}', 'Client', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:24:18.065', '2026-11-25 09:24:18.065'),
('725a0695-3bb5-4e1a-9e9c-429dab52f9ea', 'bec4931d-f5eb-4ac4-97a7-204023385706', '{{Client.Name}}', 'Client', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:20:10.391', '2026-11-25 09:20:10.391'),
('72a408a8-80ae-454b-ae1f-b0277c6831e8', 'b462c8c5-68e7-491e-886c-59ea27158991', '{{Client.Name}}', 'Client', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:26:05.542', '2026-11-25 09:26:05.542'),
('730d7390-fc65-49bf-b0cc-f673062eb815', 'b726e008-8057-43b2-88b6-e77d1b970af8', '{{Attorney.Name}}', 'ResponsibleAttorney', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:15:54.643', '2026-11-25 09:15:54.643'),
('7319c266-b97b-4891-b26a-23f3d4450c99', '941ada6d-d6b6-4a4e-aef6-310034619304', '{{Matter.MatterNumber}}', 'Matter', 'matterNumber', 1, NULL, 'NONE', NULL, '2026-11-25 09:40:01.513', '2026-11-25 09:40:01.513'),
('7378ba32-749a-4646-b5cc-3c41f463d33f', '53bc3d46-cfba-4978-aced-36898c7f25bd', '{{Attorney.Name}}', 'ResponsibleAttorney', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:33:30.964', '2026-11-25 09:33:30.964'),
('7398e47f-c22d-45a7-af5e-2a2430e71219', '3bbc2c93-4f93-48e7-828d-2a34553167e2', '{{Client.Name}}', 'Client', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:16:01.257', '2026-11-25 09:16:01.257'),
('7408919d-afc5-4d18-b3f2-7a565f9ee004', 'c64b8f15-6e35-40c5-8c00-789f96d081f5', '{{Client.Name}}', 'Client', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:29:54.499', '2026-11-25 09:29:54.499'),
('748f551f-1764-4271-824e-baf8aa8e49f8', 'ef31a912-5c20-4e9e-b072-8a9062cf43b5', '{{Matter.Title}}', 'Matter', 'title', 1, NULL, 'NONE', NULL, '2026-11-25 09:31:52.621', '2026-11-25 09:31:52.621'),
('7509c16d-01c9-40fe-a92c-7b68df021504', '3e064705-e7f1-40a4-95c4-ef2c47f0d106', '{{Matter.Title}}', 'Matter', 'title', 1, NULL, 'NONE', NULL, '2026-11-25 09:27:15.761', '2026-11-25 09:27:15.761'),
('756ce359-cde7-4195-b475-7425c7f33977', '63f83669-73d7-4103-8985-2988d5f0bd36', '{{Matter.MatterNumber}}', 'Matter', 'matterNumber', 1, NULL, 'NONE', NULL, '2026-11-25 09:28:47.493', '2026-11-25 09:28:47.493'),
('757cb8a6-b2a7-45aa-8372-cda9035fab48', '92773fd1-905b-4407-8351-96a284175b55', '{{Matter.Title}}', 'Matter', 'title', 1, NULL, 'NONE', NULL, '2026-11-25 09:25:52.825', '2026-11-25 09:25:52.825'),
('758d5c2b-39a5-47eb-8ce7-afb4b1804df4', '24be09a7-7d8c-4d14-a6ad-4438cf0d12d8', '{{Attorney.Name}}', 'ResponsibleAttorney', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:28:22.849', '2026-11-25 09:28:22.849'),
('7599dad4-7846-4ea5-be2e-3c1b8de0e0ae', '646b3030-53a2-4823-8beb-0a9acb9a9610', '{{Matter.MatterNumber}}', 'Matter', 'matterNumber', 1, NULL, 'NONE', NULL, '2026-11-25 09:41:09.163', '2026-11-25 09:41:09.163'),
('762778b4-d06c-46f7-b3a9-71d5d411e183', '4226ca5b-e6e1-45d7-9cee-96843614940c', '{{Attorney.Name}}', 'ResponsibleAttorney', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:14:03.120', '2026-11-25 09:14:03.120'),
('763e5726-5b4c-4197-b8d8-d285b7b03a29', 'eb6ab9da-aa7c-44b0-93d2-47e002eefd78', '{{Client.Name}}', 'Client', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:21:31.807', '2026-11-25 09:21:31.807'),
('767fc207-c848-4071-9d89-d305c224975f', '32f25e0b-12dd-48ac-ac0d-c0a67fdaf285', '{{Matter.MatterNumber}}', 'Matter', 'matterNumber', 1, NULL, 'NONE', NULL, '2026-11-25 09:36:20.721', '2026-11-25 09:36:20.721'),
('76944e2f-3841-4401-8449-35190b010e5d', 'c8e2f1fe-5365-44b5-a497-437d71a02c2d', '{{Attorney.Name}}', 'ResponsibleAttorney', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:26:22.331', '2026-11-25 09:26:22.331'),
('76d36535-a8de-4a01-a642-ed493d6e7556', 'b3795800-cd6e-4e96-84d4-f31e28eaab0f', '{{Matter.Title}}', 'Matter', 'title', 1, NULL, 'NONE', NULL, '2026-11-25 09:27:22.513', '2026-11-25 09:27:22.513'),
('77177b6f-b2f7-41b3-804d-203768fddd77', '2aaef701-5ea8-42cc-b381-3aad1aaac0e3', '{{Matter.Title}}', 'Matter', 'title', 1, NULL, 'NONE', NULL, '2026-11-25 09:11:16.455', '2026-11-25 09:11:16.455'),
('77baabff-838f-47df-9a2f-a2dc2d96d327', '984370bc-02f5-41d0-b559-2f0031e7ecf0', '{{Attorney.Name}}', 'ResponsibleAttorney', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:15:33.591', '2026-11-25 09:15:33.591'),
('77da8afc-e192-45ef-86f3-f4be94f74105', '61ce7918-34d9-4ca7-955c-4fc895d710ef', '{{Client.Name}}', 'Client', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:14:11.412', '2026-11-25 09:14:11.412'),
('77e44569-3b45-403a-b648-e890f84b71b2', 'e4b91c44-5bb0-4497-85c2-1ea00f432aca', '{{Matter.Title}}', 'Matter', 'title', 1, NULL, 'NONE', NULL, '2026-11-25 09:43:42.925', '2026-11-25 09:43:42.925'),
('7804b668-3909-446a-86ff-e066ea8454b6', '1bcd0da5-4d16-4f30-8022-024a77ac0d02', '{{Client.Name}}', 'Client', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:38:22.229', '2026-11-25 09:38:22.229'),
('783d6e2c-b521-4a63-acdc-18f5214196a3', '76a7a39b-0455-4895-8841-3f04be9358e1', '{{Matter.Title}}', 'Matter', 'title', 1, NULL, 'NONE', NULL, '2026-11-25 09:45:23.110', '2026-11-25 09:45:23.110'),
('79301f7a-882d-4fec-8c30-2504490655db', '3f0f23bb-0dd8-403d-ae37-f520c2cf7c4c', '{{Client.Name}}', 'Client', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:13:30.201', '2026-11-25 09:13:30.201'),
('797f43a6-f7d4-4ba7-8cbb-ea81f83a1890', '96e98b6c-5022-4a6a-8538-45dea007ec14', '{{Attorney.Name}}', 'ResponsibleAttorney', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:30:03.286', '2026-11-25 09:30:03.286'),
('798ca368-c5be-44f3-ab9a-c5e2760b0929', '0dd95a0a-5203-4716-ae35-89a0595c46d6', '{{Demand.DemandedAmount}}', 'Demand', 'demandedAmount', 0, NULL, 'CURRENCY_USD', NULL, '2026-11-25 09:19:34.708', '2026-11-25 09:19:34.708'),
('798fcb79-4577-45a0-ad70-f9a87ac10a8a', '95774654-8970-47c7-98f5-5b016d390ff1', '{{Matter.Title}}', 'Matter', 'title', 1, NULL, 'NONE', NULL, '2026-11-25 09:44:07.839', '2026-11-25 09:44:07.839'),
('799ba397-e74d-4dbf-9170-969565ba7aea', 'ec1c0e31-fed1-4081-9ec7-c1588deef41e', '{{Attorney.Name}}', 'ResponsibleAttorney', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:35:52.189', '2026-11-25 09:35:52.189'),
('79b85cf8-9443-404e-a863-1e891828b2de', 'f57ee915-26c8-4404-b8af-6a03e2a7cb59', '{{Attorney.Name}}', 'ResponsibleAttorney', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:40:41.743', '2026-11-25 09:40:41.743'),
('79dc99c5-6624-4e5b-a537-1c1aa69d8d58', '1f4de991-5e27-4cca-97fb-d30b56289a97', '{{Matter.Title}}', 'Matter', 'title', 1, NULL, 'NONE', NULL, '2026-11-25 09:17:54.539', '2026-11-25 09:17:54.539'),
('79fb5d2f-94ea-4367-9dd1-0d3328bc48fe', 'b74dc6ca-81f6-4b63-8298-1ef27989924a', '{{Matter.MatterNumber}}', 'Matter', 'matterNumber', 1, NULL, 'NONE', NULL, '2026-11-25 09:40:28.195', '2026-11-25 09:40:28.195'),
('79fd91ce-be86-4583-9d7e-b6124a211902', '784a0a67-2de8-47ac-bd8f-7b457bd3e5ce', '{{Matter.MatterNumber}}', 'Matter', 'matterNumber', 1, NULL, 'NONE', NULL, '2026-11-25 09:08:48.958', '2026-11-25 09:08:48.958'),
('7a2c09d8-3fa5-4fdd-b446-806691925cfc', 'd534334f-ffd5-4c0f-891f-4361aeabdccb', '{{Insurance.ClaimNumber}}', 'Insurance', 'claimNumber', 0, NULL, 'NONE', NULL, '2026-11-25 09:14:29.395', '2026-11-25 09:14:29.395'),
('7a461a2b-6c0d-4791-a622-8bd795511c94', '7f58167b-7eb3-464f-8b2e-1555bb0b09f6', '{{Matter.Title}}', 'Matter', 'title', 1, NULL, 'NONE', NULL, '2026-11-25 09:28:06.109', '2026-11-25 09:28:06.109'),
('7a8ed10d-a50b-4f2c-a8ba-9252395a0752', '58cfe8c5-ef3d-4a4a-b367-577985a01b75', 'Attorney.Name', 'Attorney', 'name', 1, NULL, 'NONE', NULL, '2026-11-14 09:29:43.932', '2026-11-14 09:29:43.932'),
('7ad1a58b-6062-4143-89a2-b57daac7e4f9', '1bcd8d6e-d341-40f2-a658-171ab595c104', '{{Client.Name}}', 'Client', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:42:38.075', '2026-11-25 09:42:38.075'),
('7af93f89-c949-40e8-ac2f-4ff94fa036d6', '6e95af9d-a68a-4956-9c62-18e934c98f1d', '{{Client.Name}}', 'Client', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:39:08.714', '2026-11-25 09:39:08.714'),
('7b4b4f7c-509a-4ea5-aa2b-94372bebf806', '131e2bc8-78b6-49ec-b3e2-835f46fa23ce', '{{Client.Name}}', 'Client', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:33:24.062', '2026-11-25 09:33:24.062'),
('7b50cfd1-eef2-4e3c-92aa-1a0516aca6ea', '1287a3a4-02d3-4c40-85a0-194b36a3e598', '{{Attorney.Name}}', 'ResponsibleAttorney', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:20:55.585', '2026-11-25 09:20:55.585'),
('7b632514-79df-4393-9fc4-20c7473f7aa3', '8f2d0739-761d-4c01-ade2-bfdd100e7001', '{{MedicalProvider.Name}}', 'MedicalProvider', 'name', 0, NULL, 'NONE', NULL, '2026-11-25 09:23:37.028', '2026-11-25 09:23:37.028'),
('7b863417-e559-4fa5-b4ef-56d83b829936', '9692a5aa-2e76-4c88-bb31-9f2573946b83', '{{Matter.Title}}', 'Matter', 'title', 1, NULL, 'NONE', NULL, '2026-11-25 09:09:30.940', '2026-11-25 09:09:30.940'),
('7bbfca7f-ad9a-495a-96a7-89376eae6302', 'cc5d287b-035c-4bbb-8ad8-7cc0051ffb46', '{{CurrentDate.Long}}', 'CurrentDate', 'long', 0, NULL, 'NONE', NULL, '2026-11-25 09:30:52.249', '2026-11-25 09:30:52.249'),
('7bdef3d7-7c0e-4be6-a901-3028f0cc01d5', '4189fd31-bd9b-4fce-ad0f-0e859a2cdb7d', '{{Matter.Title}}', 'Matter', 'title', 1, NULL, 'NONE', NULL, '2026-11-25 09:10:10.077', '2026-11-25 09:10:10.077'),
('7c4e2983-32f4-4340-a3f6-2c7a225102a1', '684d2593-9a02-43e0-8595-0167ccf0ccc7', '{{Matter.MatterNumber}}', 'Matter', 'matterNumber', 1, NULL, 'NONE', NULL, '2026-11-25 09:15:45.512', '2026-11-25 09:15:45.512'),
('7cb4f468-8f27-471d-8551-d79bf0440cb2', 'bdca2373-61f4-4959-92a9-51597dde69c2', '{{Attorney.Name}}', 'ResponsibleAttorney', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:24:25.273', '2026-11-25 09:24:25.273'),
('7cec061e-586a-40c2-9727-c3ca85e197b5', '58cfe8c5-ef3d-4a4a-b367-577985a01b75', 'MedicalProvider.Name', 'MedicalProvider', 'name', 1, NULL, 'NONE', NULL, '2026-11-14 09:29:43.932', '2026-11-14 09:29:43.932'),
('7d1d9de5-202b-4fe1-bf09-59a1df7aef9f', 'bd5f9e2c-a31a-47ab-98fa-b2098f51e5dd', '{{Matter.MatterNumber}}', 'Matter', 'matterNumber', 1, NULL, 'NONE', NULL, '2026-11-25 09:35:14.725', '2026-11-25 09:35:14.725'),
('7d4151f2-eb7b-4a04-b076-a1f194650daa', '17b2f3bb-0fbb-4884-a827-24f65dc7b81e', '{{Client.Name}}', 'Client', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:15:27.042', '2026-11-25 09:15:27.042'),
('7dd08e35-f34a-4683-bcb5-95ca8fcb365c', '8550fd39-39c9-46e4-ac0d-b95d3ed4d125', '{{Attorney.Name}}', 'ResponsibleAttorney', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:36:56.022', '2026-11-25 09:36:56.022'),
('7dd8ed9f-7e0a-4577-a1b6-1e760b9af5a6', '5d439c99-f896-4a7f-99e9-3f7c2bf237a9', '{{Matter.Title}}', 'Matter', 'title', 1, NULL, 'NONE', NULL, '2026-11-25 09:20:48.401', '2026-11-25 09:20:48.401'),
('7de29fe6-32bd-4524-871f-19dc1d1c36df', '684d2593-9a02-43e0-8595-0167ccf0ccc7', '{{Matter.Title}}', 'Matter', 'title', 1, NULL, 'NONE', NULL, '2026-11-25 09:15:45.512', '2026-11-25 09:15:45.512'),
('7deec2a7-7137-49c7-b999-d40d793cd532', '5dc8f9f7-ab83-4e49-bd46-3760dd97a48f', '{{Client.Name}}', 'Client', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:32:01.647', '2026-11-25 09:32:01.647'),
('7e0e563a-6d5d-4407-b0c9-072688a746c3', 'f55f9f4b-1665-4b30-acba-b249d2a03da2', '{{Client.Name}}', 'Client', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:44:42.548', '2026-11-25 09:44:42.548'),
('7e421bc0-d2a5-44c3-b4de-f8e54f72e84f', 'd24a965c-788a-4dc5-93f8-b25f2bcc6604', '{{Client.Name}}', 'Client', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:15:39.655', '2026-11-25 09:15:39.655'),
('7e44aea9-4c9a-4e7b-a1b6-dbb7a4f3f0c6', 'd9c65b2f-6e94-46e1-81c0-92616ad8d297', '{{Client.Name}}', 'Client', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:11:06.672', '2026-11-25 09:11:06.672'),
('7e5ee19e-6192-4109-84ee-bc272584148e', 'cf3f8036-b51a-4805-9815-f7e0ab87f802', '{{Matter.Title}}', 'Matter', 'title', 1, NULL, 'NONE', NULL, '2026-11-25 09:25:10.406', '2026-11-25 09:25:10.406'),
('7e6641c0-a557-4e5d-94fa-c58cef0bb79a', 'f9b4e048-4705-4414-a181-411253453bf6', '{{Matter.Title}}', 'Matter', 'title', 1, NULL, 'NONE', NULL, '2026-11-25 09:23:20.542', '2026-11-25 09:23:20.542'),
('7e78749e-a90d-4989-861b-efb72ff9c886', 'f0f60427-2e97-4056-bd3a-cf9f245eae61', '{{Attorney.Name}}', 'ResponsibleAttorney', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:38:53.675', '2026-11-25 09:38:53.675'),
('7e86c0ba-7c53-4254-b3dc-36416a45e56f', 'f0166dee-f985-4d9b-b2de-6cfe1f8ad7d3', '{{Attorney.Name}}', 'ResponsibleAttorney', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:06:57.490', '2026-11-25 09:06:57.490'),
('7ea7c20e-66e2-4f65-b0ab-e93e33ecee2e', '408fd535-3b97-461c-8322-f60137e1dd85', '{{Matter.Title}}', 'Matter', 'title', 1, NULL, 'NONE', NULL, '2026-11-25 09:28:53.764', '2026-11-25 09:28:53.764'),
('7efd6269-20c6-4c51-a50f-a0812f503612', '55c75bd5-de4c-42aa-8bef-cc597dec5070', '{{CurrentDate.Long}}', 'CurrentDate', 'long', 0, NULL, 'NONE', NULL, '2026-11-25 09:40:56.254', '2026-11-25 09:40:56.254'),
('7f0bd888-b6b0-4ea4-be9e-e199777cef5a', 'aae4c646-eab5-45dd-97ce-81bb12c1077d', '{{Matter.Title}}', 'Matter', 'title', 1, NULL, 'NONE', NULL, '2026-11-25 09:31:24.862', '2026-11-25 09:31:24.862'),
('7f2015ce-3759-4ecd-9906-d1a9ef33dc67', 'b74dc6ca-81f6-4b63-8298-1ef27989924a', '{{Client.Name}}', 'Client', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:40:28.195', '2026-11-25 09:40:28.195'),
('7f2f8d5c-2e2e-4558-b6a0-6e638050df48', '9024acc9-4c92-4c96-b980-7c11389d10a9', '{{Client.Name}}', 'Client', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:38:02.180', '2026-11-25 09:38:02.180'),
('7f67f3c9-da8a-42ee-929c-14b6e905071a', 'e4b91c44-5bb0-4497-85c2-1ea00f432aca', '{{Matter.MatterNumber}}', 'Matter', 'matterNumber', 1, NULL, 'NONE', NULL, '2026-11-25 09:43:42.925', '2026-11-25 09:43:42.925'),
('7f78b398-17fc-4917-bf35-9ec6f660408c', 'f57ee915-26c8-4404-b8af-6a03e2a7cb59', '{{Matter.Title}}', 'Matter', 'title', 1, NULL, 'NONE', NULL, '2026-11-25 09:40:41.743', '2026-11-25 09:40:41.743'),
('7fc72251-73cd-41e1-9093-f1c359442e72', '4dd43b62-0d3b-44e7-81cb-7adce004b7a6', '{{Matter.Title}}', 'Matter', 'title', 1, NULL, 'NONE', NULL, '2026-11-25 09:34:41.992', '2026-11-25 09:34:41.992'),
('809c11de-700f-4ba7-93f4-42ef045a6055', 'a967c641-7597-468e-bfa1-bccc3668a316', '{{Client.Name}}', 'Client', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:23:57.599', '2026-11-25 09:23:57.599'),
('80b8c8d2-24fc-4946-b233-79778d6c1a54', '784a0a67-2de8-47ac-bd8f-7b457bd3e5ce', '{{Client.Name}}', 'Client', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:08:48.958', '2026-11-25 09:08:48.958'),
('80b9da37-178f-481d-8bb5-2df8c37dae1e', '42179f92-f848-41f2-9b02-33744044ae7a', '{{Matter.Title}}', 'Matter', 'title', 1, NULL, 'NONE', NULL, '2026-11-25 09:09:18.012', '2026-11-25 09:09:18.012'),
('80c9caec-ff85-427d-b237-177db21eaee1', '7e30837a-d454-41ca-9705-e2a4f1ceccf7', '{{Matter.MatterNumber}}', 'Matter', 'matterNumber', 1, NULL, 'NONE', NULL, '2026-11-25 09:43:52.167', '2026-11-25 09:43:52.167'),
('81460501-e121-4507-ad1b-2c25aef03778', 'd554bfda-8bce-4121-a8fa-a94f5da56ba5', 'Insurance.AdjusterName', 'Insurance', 'adjusterName', 1, NULL, 'NONE', NULL, '2026-11-14 09:29:36.759', '2026-11-14 09:29:36.759'),
('814c1fad-2960-41ab-9dfc-def8722062a5', '0527cd62-fdb7-4653-b0db-0199b267563c', '{{CurrentDate.Long}}', 'CurrentDate', 'long', 0, NULL, 'NONE', NULL, '2026-11-25 09:22:44.662', '2026-11-25 09:22:44.662'),
('8151038c-b9ef-46de-aa9c-5a1c54aac09a', 'c59cf2fd-2725-4f2d-ad2c-f2023addff3e', '{{Matter.MatterNumber}}', 'Matter', 'matterNumber', 1, NULL, 'NONE', NULL, '2026-11-25 09:43:34.906', '2026-11-25 09:43:34.906'),
('81590753-1d06-4998-a9fb-b4311436b517', '926f9447-7b92-4349-b757-c0132e4f8be6', '{{Client.Name}}', 'Client', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:12:29.314', '2026-11-25 09:12:29.314'),
('81e80ac5-82ef-40f0-a7c7-e669b1c54ec2', '8beb6f2e-6342-4443-b215-aaa6e92c6614', '{{Client.Name}}', 'Client', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:07:05.165', '2026-11-25 09:07:05.165'),
('81fbf5ac-58be-4718-af7d-b9d2321d5ada', '6e95af9d-a68a-4956-9c62-18e934c98f1d', '{{Matter.Title}}', 'Matter', 'title', 1, NULL, 'NONE', NULL, '2026-11-25 09:39:08.714', '2026-11-25 09:39:08.714'),
('8230f3ac-90a2-4f23-b4fa-d09418198b62', 'ef522887-592a-4660-91a0-efe24715406f', '{{Matter.MatterNumber}}', 'Matter', 'matterNumber', 1, NULL, 'NONE', NULL, '2026-11-25 09:09:43.379', '2026-11-25 09:09:43.379'),
('823b9ab7-2b42-4061-86ec-b1b24b4d6f76', 'b849065e-953a-4107-b563-5df696d006f2', '{{Matter.Title}}', 'Matter', 'title', 1, NULL, 'NONE', NULL, '2026-11-25 09:15:19.926', '2026-11-25 09:15:19.926'),
('829b6558-e0ee-4785-a56e-564f5dd4c099', '02dd54d6-98d0-413c-8b37-8b1dd6a1369d', '{{Attorney.Name}}', 'ResponsibleAttorney', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:44:21.971', '2026-11-25 09:44:21.971'),
('82f1c7f0-2d02-419d-992d-fabde1aa8139', '38dfc741-2eb3-490f-aee9-85ee6a82c9f5', '{{Matter.Title}}', 'Matter', 'title', 1, NULL, 'NONE', NULL, '2026-11-25 09:35:22.673', '2026-11-25 09:35:22.673'),
('82fb3cba-9a3e-4a38-aa91-8779e696462d', 'a25a6d17-8108-426c-84a8-84dddb0d4e14', '{{Matter.MatterNumber}}', 'Matter', 'matterNumber', 1, NULL, 'NONE', NULL, '2026-11-25 09:18:08.122', '2026-11-25 09:18:08.122'),
('835d3340-43dd-4971-a019-00eb7f2c0afa', '836e1674-9f3e-4b15-bbdf-71e9f39cf358', '{{Incident.AccidentDate}}', 'Incident', 'accidentDate', 0, NULL, 'DATE_LONG', NULL, '2026-11-25 09:22:21.046', '2026-11-25 09:22:21.046'),
('8386c645-e82a-438e-9f13-c6837d5f2514', '0527cd62-fdb7-4653-b0db-0199b267563c', '{{MedicalProvider.Name}}', 'MedicalProvider', 'name', 0, NULL, 'NONE', NULL, '2026-11-25 09:22:44.662', '2026-11-25 09:22:44.662'),
('83cc9d45-7137-4f04-b7c7-55f358a256d5', '60d52c8c-966e-4e95-b691-cbc80e8d385f', '{{Matter.Title}}', 'Matter', 'title', 1, NULL, 'NONE', NULL, '2026-11-25 09:39:41.551', '2026-11-25 09:39:41.551'),
('83d953b1-eebf-4227-a5e0-b2c20a539426', '4a8557bf-69eb-447c-b559-e45c3ee6584d', '{{Client.Name}}', 'Client', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:43:19.390', '2026-11-25 09:43:19.390'),
('83f388af-2b1e-4854-ae5d-de7f9e8f62bb', '34c7c015-df07-496e-ae4a-c4d9cf030a99', '{{Matter.Title}}', 'Matter', 'title', 1, NULL, 'NONE', NULL, '2026-11-25 09:18:50.518', '2026-11-25 09:18:50.518'),
('842d02ff-094e-47fe-bd49-46439d9fc979', '9ab91dff-b35e-4c69-95a1-880497ac24d3', '{{Attorney.Name}}', 'ResponsibleAttorney', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:21:48.687', '2026-11-25 09:21:48.687'),
('8433761f-0c1e-4b8e-b0b5-fdd460504c8d', 'c4dad4e6-b06d-4b22-acfe-86fcc2611079', '{{Client.Name}}', 'Client', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:36:07.075', '2026-11-25 09:36:07.075'),
('84556928-92f3-4b88-88d8-9a10589a6713', '0dd95a0a-5203-4716-ae35-89a0595c46d6', '{{Matter.MatterNumber}}', 'Matter', 'matterNumber', 1, NULL, 'NONE', NULL, '2026-11-25 09:19:34.708', '2026-11-25 09:19:34.708'),
('84dd27ed-bba3-44f1-84ac-e7e2a42c0737', '984370bc-02f5-41d0-b559-2f0031e7ecf0', '{{Client.Name}}', 'Client', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:15:33.591', '2026-11-25 09:15:33.591'),
('85090d43-ee05-418e-8799-70fe4d85ce90', 'a82ecdb1-9acb-40ed-a3e9-b39f93371ff7', '{{Matter.Title}}', 'Matter', 'title', 1, NULL, 'NONE', NULL, '2026-11-25 09:32:16.690', '2026-11-25 09:32:16.690'),
('85334cef-a1f3-45a5-a821-83cf6aecfaff', 'ab7e814b-ed5e-4402-8e4e-3c7f1fbae3e7', '{{Client.Name}}', 'Client', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:41:44.613', '2026-11-25 09:41:44.613'),
('85382286-ccb5-4e48-8f5d-452ae2a4b528', 'd24c9473-cba3-4708-a4ef-3e4fb5ed825c', '{{Client.Name}}', 'Client', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:38:28.453', '2026-11-25 09:38:28.453'),
('855a22fd-8645-4a9f-a7ec-59b3abf69718', '0a100241-1565-4041-8f2b-b25c3d3292a6', '{{Client.Name}}', 'Client', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:11:37.540', '2026-11-25 09:11:37.540'),
('8573b1c7-843c-4a8b-9163-c7f1fc6fb00e', '34590700-cfd8-4fe4-bbd5-8519dee10003', '{{CurrentDate.Long}}', 'CurrentDate', 'long', 0, NULL, 'NONE', NULL, '2026-11-25 09:37:15.408', '2026-11-25 09:37:15.408'),
('8580fe77-41d0-45fa-b156-2f0a708ec6fa', '08788e72-5146-48ca-98ce-5982d0d2b77f', '{{Attorney.Name}}', 'ResponsibleAttorney', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:32:52.802', '2026-11-25 09:32:52.802'),
('85d24baf-9f9a-4651-80e7-3dc9102f742b', 'a82ecdb1-9acb-40ed-a3e9-b39f93371ff7', '{{Matter.MatterNumber}}', 'Matter', 'matterNumber', 1, NULL, 'NONE', NULL, '2026-11-25 09:32:16.690', '2026-11-25 09:32:16.690'),
('86cdc09c-fa5f-42b6-a889-7a240722846f', '899c0e12-1011-483a-885a-3dd965fc3a50', '{{Attorney.Name}}', 'ResponsibleAttorney', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:44:34.395', '2026-11-25 09:44:34.395'),
('86d9628e-cea1-4779-97e0-d3db753f631a', '613a6b40-e687-4fef-b6fb-073e8e3bf25a', '{{Client.Name}}', 'Client', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:38:08.829', '2026-11-25 09:38:08.829'),
('86fcd9a9-8810-4225-8526-0bf1aff40624', '73efedfc-9f48-4cbe-960a-523e0de00400', '{{Incident.AccidentDate}}', 'Incident', 'accidentDate', 0, NULL, 'DATE_LONG', NULL, '2026-11-25 09:21:03.947', '2026-11-25 09:21:03.947'),
('875beb96-f7eb-4957-9c7c-849d1286c779', 'ef522887-592a-4660-91a0-efe24715406f', '{{Client.Name}}', 'Client', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:09:43.379', '2026-11-25 09:09:43.379'),
('8819d487-fdde-45a8-ae27-4b6a09d906f8', 'd795264a-186b-4ff7-90ce-a6483dbb71ee', '{{Client.Name}}', 'Client', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:42:01.887', '2026-11-25 09:42:01.887'),
('8831c5ad-c6bd-4698-88da-e0724aca8d12', '2f5620bd-ff68-4eda-8b79-fe8f49ae40db', '{{Matter.Title}}', 'Matter', 'title', 1, NULL, 'NONE', NULL, '2026-11-25 09:34:22.712', '2026-11-25 09:34:22.712'),
('8893f639-c60a-4b6d-b71f-ca1b54110df6', '84b6150f-c07b-449b-bc21-dc242056935f', '{{Matter.Title}}', 'Matter', 'title', 1, NULL, 'NONE', NULL, '2026-11-25 09:30:44.324', '2026-11-25 09:30:44.324'),
('88ba6d6e-a635-4348-ab70-d7f97ec5843f', 'aae04ae9-b293-4539-a12a-781f0d71b8d1', '{{Matter.Title}}', 'Matter', 'title', 1, NULL, 'NONE', NULL, '2026-11-25 09:13:38.494', '2026-11-25 09:13:38.494'),
('88ef8467-83a0-4fb6-83a2-12291551c66c', '60d1ffef-c3d2-4057-9737-b1eae70d5f43', '{{Matter.MatterNumber}}', 'Matter', 'matterNumber', 1, NULL, 'NONE', NULL, '2026-11-25 09:29:31.214', '2026-11-25 09:29:31.214'),
('88f57bb9-57e8-4b8c-8e46-07d836e34aee', 'd24a965c-788a-4dc5-93f8-b25f2bcc6604', '{{Matter.Title}}', 'Matter', 'title', 1, NULL, 'NONE', NULL, '2026-11-25 09:15:39.655', '2026-11-25 09:15:39.655'),
('88f98420-9e11-48f8-90f8-21b0e5f9ae19', 'c09cb221-7da0-4fcd-bc6a-15258f26daf1', '{{Client.Name}}', 'Client', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:43:00.472', '2026-11-25 09:43:00.472'),
('892b376a-7a81-42eb-a627-0a534b43b2c8', '64dd38ea-8636-4110-ada9-9363f9452197', '{{Matter.Title}}', 'Matter', 'title', 1, NULL, 'NONE', NULL, '2026-11-25 09:28:29.468', '2026-11-25 09:28:29.468'),
('894199d4-b56c-4bcc-842c-5500056d8668', '38dfc741-2eb3-490f-aee9-85ee6a82c9f5', '{{Attorney.Name}}', 'ResponsibleAttorney', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:35:22.673', '2026-11-25 09:35:22.673'),
('8978aaaa-9950-4430-85ab-eee0be6a5770', 'a9155966-0259-44c6-b2d3-e443b4534244', '{{Matter.Title}}', 'Matter', 'title', 1, NULL, 'NONE', NULL, '2026-11-25 09:24:18.065', '2026-11-25 09:24:18.065'),
('89908807-6beb-4fdd-958a-35f4d8140daf', 'c5ce2bf6-f9cf-464a-b12a-e34c4d9749cc', '{{Matter.MatterNumber}}', 'Matter', 'matterNumber', 1, NULL, 'NONE', NULL, '2026-11-25 09:28:17.723', '2026-11-25 09:28:17.723'),
('89c911c5-2fdc-4771-a24a-ed7e39dbd0a6', '77fbb573-40db-43ef-b3f6-7856e2272e2e', '{{Matter.MatterNumber}}', 'Matter', 'matterNumber', 1, NULL, 'NONE', NULL, '2026-11-25 09:25:46.767', '2026-11-25 09:25:46.767'),
('89ed2973-c84f-4f6e-b122-125346af9277', 'b849065e-953a-4107-b563-5df696d006f2', '{{Matter.MatterNumber}}', 'Matter', 'matterNumber', 1, NULL, 'NONE', NULL, '2026-11-25 09:15:19.926', '2026-11-25 09:15:19.926'),
('8a0ee879-6c76-4fde-b5f4-77cebc9d758f', '06b41a84-824b-4759-b3f2-d49f9828dd05', '{{Matter.MatterNumber}}', 'Matter', 'matterNumber', 1, NULL, 'NONE', NULL, '2026-11-25 09:37:02.335', '2026-11-25 09:37:02.335'),
('8a5223ae-6c97-4e7f-81a3-ddf298894820', '6e739347-97f7-4a33-b95c-78043f9aed05', '{{Matter.MatterNumber}}', 'Matter', 'matterNumber', 1, NULL, 'NONE', NULL, '2026-11-25 09:19:52.633', '2026-11-25 09:19:52.633'),
('8aa991bf-c8b4-40ed-839e-a5e2ea3466b9', 'a6c30529-d5fe-4ef6-88f7-5646308ae386', '{{Matter.MatterNumber}}', 'Matter', 'matterNumber', 1, NULL, 'NONE', NULL, '2026-11-25 09:30:28.757', '2026-11-25 09:30:28.757'),
('8ae9e651-39ac-4197-aa32-623f1002f312', '3a87d8d8-132a-4617-8d8d-eab7b162be4a', '{{Client.Name}}', 'Client', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:29:16.116', '2026-11-25 09:29:16.116'),
('8b07c3f8-f93e-4fe4-b79b-32a7e22b4867', '27f17c2f-55ae-406c-8d5d-1cde5931934d', '{{Matter.Title}}', 'Matter', 'title', 1, NULL, 'NONE', NULL, '2026-11-25 09:31:06.958', '2026-11-25 09:31:06.958'),
('8b1fff47-8faf-444e-8a4e-765533cc249c', 'f1de25a4-0c3e-4065-8ed5-d194d16ccebd', '{{Matter.Title}}', 'Matter', 'title', 1, NULL, 'NONE', NULL, '2026-11-25 09:18:01.776', '2026-11-25 09:18:01.776'),
('8b21b76b-3c7c-462a-887c-839a39c90bea', '47eba881-7be9-448c-a110-8e078bcd7706', '{{Attorney.Name}}', 'ResponsibleAttorney', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:31:33.372', '2026-11-25 09:31:33.372'),
('8b52e2eb-490c-44db-b6bc-2652ffd0ebb0', '229186e0-fd2e-47f1-8232-6cb06d441d40', '{{Client.Name}}', 'Client', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:26:52.668', '2026-11-25 09:26:52.668'),
('8b830cff-f053-4985-982a-d75fff908711', '82f334d4-a724-4cf7-834d-e7ffeb29d708', '{{Matter.MatterNumber}}', 'Matter', 'matterNumber', 1, NULL, 'NONE', NULL, '2026-11-25 09:43:26.986', '2026-11-25 09:43:26.986'),
('8b8f0a1e-89ae-4484-bb83-b9140477817e', '6e739347-97f7-4a33-b95c-78043f9aed05', '{{Insurance.ClaimNumber}}', 'Insurance', 'claimNumber', 0, NULL, 'NONE', NULL, '2026-11-25 09:19:52.633', '2026-11-25 09:19:52.633'),
('8b93fd2d-43f5-4b9f-beba-9a2957b1daaa', '5e4ca444-af6e-4f60-a8d2-89e32991db04', '{{Attorney.Name}}', 'ResponsibleAttorney', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:40:15.393', '2026-11-25 09:40:15.393'),
('8baf5cb1-175d-4b31-8eb3-dc50c9c2bdce', '55c75bd5-de4c-42aa-8bef-cc597dec5070', '{{Matter.MatterNumber}}', 'Matter', 'matterNumber', 1, NULL, 'NONE', NULL, '2026-11-25 09:40:56.254', '2026-11-25 09:40:56.254'),
('8be31b5d-7fba-482f-9d10-dd3eef0d263f', '226f643a-3838-4870-ace9-92382b262487', '{{Attorney.Name}}', 'ResponsibleAttorney', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:16:13.582', '2026-11-25 09:16:13.582'),
('8bff0d95-8298-409e-ad70-b2d06c28c0ec', 'd220f2ef-879d-4a4c-baa4-9701c3f16d60', '{{Incident.AccidentDate}}', 'Incident', 'accidentDate', 0, NULL, 'DATE_LONG', NULL, '2026-11-25 09:20:32.818', '2026-11-25 09:20:32.818'),
('8c2c5fa2-dcd9-48a2-9538-abf03ad3db42', '7d717061-8a01-4197-a7ba-9aac4c28051c', '{{Matter.Title}}', 'Matter', 'title', 1, NULL, 'NONE', NULL, '2026-11-25 09:42:22.666', '2026-11-25 09:42:22.666'),
('8ca3672f-ad94-4ddd-9f42-8eb3a9dfb492', '76a7a39b-0455-4895-8841-3f04be9358e1', '{{CurrentDate.Long}}', 'CurrentDate', 'long', 0, NULL, 'NONE', NULL, '2026-11-25 09:45:23.110', '2026-11-25 09:45:23.110'),
('8d056817-be7d-43af-8616-b3fbfc0a8b32', 'aae04ae9-b293-4539-a12a-781f0d71b8d1', '{{Client.Name}}', 'Client', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:13:38.494', '2026-11-25 09:13:38.494'),
('8d9d440a-1454-498c-a56d-92aeeac1205e', '408fd535-3b97-461c-8322-f60137e1dd85', '{{Attorney.Name}}', 'ResponsibleAttorney', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:28:53.764', '2026-11-25 09:28:53.764'),
('8db6ed8b-5b59-455b-8b3c-921d60499ac4', '5f1bd215-9ae3-4d54-abcb-1e3ee92b3623', '{{Matter.Title}}', 'Matter', 'title', 1, NULL, 'NONE', NULL, '2026-11-25 09:39:28.396', '2026-11-25 09:39:28.396');
INSERT INTO `document_field_mappings` (`id`, `template_version_id`, `placeholder_tag`, `source_entity`, `source_field`, `is_required`, `default_value`, `formatting_rule`, `conditional_expression`, `created_at`, `updated_at`) VALUES
('8df6e125-cad0-453c-86bf-696b9e4653eb', '05d6bd45-cbbf-4e86-852e-fac15162a534', '{{Client.Name}}', 'Client', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:42:45.141', '2026-11-25 09:42:45.141'),
('8e289e13-4f15-463d-8677-c97867853c49', '61ce7918-34d9-4ca7-955c-4fc895d710ef', '{{Matter.Title}}', 'Matter', 'title', 1, NULL, 'NONE', NULL, '2026-11-25 09:14:11.412', '2026-11-25 09:14:11.412'),
('8e2c2454-ea8a-4abc-8ea8-73c27463aac9', '3d93dfc7-961e-4026-b271-9ba36c32e208', '{{Attorney.Name}}', 'ResponsibleAttorney', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:09:52.800', '2026-11-25 09:09:52.800'),
('8e90d205-4c47-4056-97be-b628e82dd7ba', '87d1c498-8bb5-43b1-b07b-9b85ff412ce8', '{{Attorney.Name}}', 'ResponsibleAttorney', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:33:01.955', '2026-11-25 09:33:01.955'),
('8ee9138c-5687-4fe3-a42f-f36d60d78d20', '711d7253-2ea0-4e60-81b3-fb542fd7c2fa', '{{Matter.MatterNumber}}', 'Matter', 'matterNumber', 1, NULL, 'NONE', NULL, '2026-11-25 09:13:17.503', '2026-11-25 09:13:17.503'),
('8f3e5586-e632-4b86-b511-72c329702605', 'ee7a648c-6b21-4a0f-bdc7-1f83084301aa', '{{Attorney.Name}}', 'ResponsibleAttorney', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:24:36.756', '2026-11-25 09:24:36.756'),
('8f564f73-902b-4800-b15e-24f603f61f9e', '836e1674-9f3e-4b15-bbdf-71e9f39cf358', '{{Matter.MatterNumber}}', 'Matter', 'matterNumber', 1, NULL, 'NONE', NULL, '2026-11-25 09:22:21.046', '2026-11-25 09:22:21.046'),
('8f7612b7-1b87-4ddc-bffe-92dfa71f5801', '5dec737b-658f-47fb-9d9c-5f761ab5d42f', '{{Attorney.Name}}', 'ResponsibleAttorney', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:30:35.622', '2026-11-25 09:30:35.622'),
('8f8c5b85-4bad-4700-8cf2-cde9978b15ba', '899c0e12-1011-483a-885a-3dd965fc3a50', '{{Matter.MatterNumber}}', 'Matter', 'matterNumber', 1, NULL, 'NONE', NULL, '2026-11-25 09:44:34.395', '2026-11-25 09:44:34.395'),
('8f93cd15-7403-480e-86d3-fcb16556eaff', '7402b6b9-9787-4ceb-8664-88ca07ac3156', '{{Attorney.Name}}', 'ResponsibleAttorney', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:23:50.365', '2026-11-25 09:23:50.365'),
('8fb5af44-f2da-4a0d-a004-7775efc59350', 'c436f021-cecd-4c60-9cba-9fc95cea429c', '{{Matter.Title}}', 'Matter', 'title', 1, NULL, 'NONE', NULL, '2026-11-25 09:34:36.019', '2026-11-25 09:34:36.019'),
('9030dca7-4045-473c-a345-c6fbc42f9b86', '02f61270-49a4-46bb-87ec-b6a95478b939', '{{Matter.MatterNumber}}', 'Matter', 'matterNumber', 1, NULL, 'NONE', NULL, '2026-11-25 09:08:19.002', '2026-11-25 09:08:19.002'),
('905be571-cc8e-4dcf-9c88-12ec167f14bd', '1bcd0da5-4d16-4f30-8022-024a77ac0d02', '{{Attorney.Name}}', 'ResponsibleAttorney', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:38:22.229', '2026-11-25 09:38:22.229'),
('9066866d-c691-4469-8480-53bc90fa97b9', 'abc8d0dd-9195-4d6d-a0b6-0813f8842c54', '{{Matter.MatterNumber}}', 'Matter', 'matterNumber', 1, NULL, 'NONE', NULL, '2026-11-25 09:34:10.516', '2026-11-25 09:34:10.516'),
('907f1e57-2171-4ad4-9118-bd2b06a3e5c1', 'b2a1dfa2-e833-452c-8130-04e0b55d4a1d', '{{Matter.Title}}', 'Matter', 'title', 1, NULL, 'NONE', NULL, '2026-11-25 09:14:52.736', '2026-11-25 09:14:52.736'),
('90ac6a58-c7f6-4532-8997-d9784a9522db', '0e4344b0-09b4-4cdd-8f95-c257f94fdc79', '{{CurrentDate.Long}}', 'CurrentDate', 'long', 0, NULL, 'NONE', NULL, '2026-11-25 09:22:04.507', '2026-11-25 09:22:04.507'),
('9103a7ca-c955-4367-b16b-a228ef86a6e6', '7c065d2e-46e5-4be9-8aca-231b61f602ae', '{{Attorney.Name}}', 'ResponsibleAttorney', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:18:27.169', '2026-11-25 09:18:27.169'),
('914bb932-cf21-4b93-9157-6523d2ce4665', 'a96ffd2f-f9c7-45bb-ac53-791da9d25353', '{{Client.Name}}', 'Client', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:27:27.990', '2026-11-25 09:27:27.990'),
('91bcd02f-22f0-4122-947a-154f32481d88', 'ef31a912-5c20-4e9e-b072-8a9062cf43b5', '{{Matter.MatterNumber}}', 'Matter', 'matterNumber', 1, NULL, 'NONE', NULL, '2026-11-25 09:31:52.621', '2026-11-25 09:31:52.621'),
('91cc30cb-38aa-485f-ae88-315f24566c02', '32f25e0b-12dd-48ac-ac0d-c0a67fdaf285', '{{Matter.Title}}', 'Matter', 'title', 1, NULL, 'NONE', NULL, '2026-11-25 09:36:20.721', '2026-11-25 09:36:20.721'),
('921e2631-b8f4-4315-82da-90bfffe7b2f0', '1c97c77a-8d55-4921-b569-90482c80ddac', '{{Client.Name}}', 'Client', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:27:41.448', '2026-11-25 09:27:41.448'),
('924f458d-0090-4753-854d-c51f22e42487', '25ed3bd4-4976-43e6-9a0f-75696cae49f6', '{{Client.Name}}', 'Client', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:37:34.236', '2026-11-25 09:37:34.236'),
('928b510d-b026-4221-aa28-4eab10801fae', '7589c3cd-fd6c-4337-9606-20bc893e01e2', '{{Matter.MatterNumber}}', 'Matter', 'matterNumber', 1, NULL, 'NONE', NULL, '2026-11-25 09:32:44.786', '2026-11-25 09:32:44.786'),
('92923fa3-5d39-4cd7-bfd9-82002434a33f', '8beb6f2e-6342-4443-b215-aaa6e92c6614', '{{Matter.MatterNumber}}', 'Matter', 'matterNumber', 1, NULL, 'NONE', NULL, '2026-11-25 09:07:05.165', '2026-11-25 09:07:05.165'),
('92dde02e-470e-493a-97a5-054db1509bbd', '6d06086f-03a4-44c6-a96d-fc371f6f8967', '{{Client.Name}}', 'Client', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:44:49.450', '2026-11-25 09:44:49.450'),
('93338762-1fed-4d10-a44a-d37321cbfd4b', '1bcd0da5-4d16-4f30-8022-024a77ac0d02', '{{Matter.Title}}', 'Matter', 'title', 1, NULL, 'NONE', NULL, '2026-11-25 09:38:22.229', '2026-11-25 09:38:22.229'),
('934decab-8c1b-48f3-8535-b9c5b3701f48', '5e4ca444-af6e-4f60-a8d2-89e32991db04', '{{Matter.Title}}', 'Matter', 'title', 1, NULL, 'NONE', NULL, '2026-11-25 09:40:15.393', '2026-11-25 09:40:15.393'),
('934e0078-e3a3-4416-8096-a6e5c92fc428', '3dcceccc-1e07-4dd6-8f21-e7a09f064265', '{{Matter.MatterNumber}}', 'Matter', 'matterNumber', 1, NULL, 'NONE', NULL, '2026-11-25 09:12:01.509', '2026-11-25 09:12:01.509'),
('93f96b27-520b-41ca-bbeb-a742e6df6041', '2c0605e3-233d-47b9-b595-5dc7dedf36a1', '{{Attorney.Name}}', 'ResponsibleAttorney', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:39:01.771', '2026-11-25 09:39:01.771'),
('940053f5-b7a8-4fc1-a3d5-99996709a6e6', '17a56c0b-c6dd-4ffe-a43d-9606642e8ed3', '{{Matter.Title}}', 'Matter', 'title', 1, NULL, 'NONE', NULL, '2026-11-25 09:23:31.235', '2026-11-25 09:23:31.235'),
('947839f5-727f-4907-9591-fbe7587d3408', '4226ca5b-e6e1-45d7-9cee-96843614940c', '{{Matter.MatterNumber}}', 'Matter', 'matterNumber', 1, NULL, 'NONE', NULL, '2026-11-25 09:14:03.120', '2026-11-25 09:14:03.120'),
('948f7c77-9ee4-4e4f-8199-63b511b3d5a7', '711d7253-2ea0-4e60-81b3-fb542fd7c2fa', '{{Matter.Title}}', 'Matter', 'title', 1, NULL, 'NONE', NULL, '2026-11-25 09:13:17.503', '2026-11-25 09:13:17.503'),
('94e3beb5-838e-45f2-bb74-32edb090e6b0', 'f0f60427-2e97-4056-bd3a-cf9f245eae61', '{{Matter.MatterNumber}}', 'Matter', 'matterNumber', 1, NULL, 'NONE', NULL, '2026-11-25 09:38:53.675', '2026-11-25 09:38:53.675'),
('953f28c0-bbcb-4a63-a81f-96e3aa05f125', '5dec737b-658f-47fb-9d9c-5f761ab5d42f', '{{Matter.Title}}', 'Matter', 'title', 1, NULL, 'NONE', NULL, '2026-11-25 09:30:35.622', '2026-11-25 09:30:35.622'),
('9579e755-42c3-4660-b5c0-b656262714c1', 'cca756c1-e79e-4d0f-9f90-2b03eac1cbe1', '{{Client.Name}}', 'Client', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:13:05.421', '2026-11-25 09:13:05.421'),
('958d0ad4-7671-4c41-b049-567b479484b7', '3d32beda-4c29-4858-a945-a78c68a9eb1c', '{{Matter.MatterNumber}}', 'Matter', 'matterNumber', 1, NULL, 'NONE', NULL, '2026-11-25 09:19:04.418', '2026-11-25 09:19:04.418'),
('962bc784-058b-49c4-bc52-dc0b4e83bf10', '05e48612-750f-40cb-b0e5-13058702e7aa', '{{Attorney.Name}}', 'ResponsibleAttorney', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:08:12.860', '2026-11-25 09:08:12.860'),
('96a5d6f0-db58-4ce1-87b9-93dccb73e082', '0546be74-b575-4c89-9c7e-4dde025b29d8', '{{Matter.Title}}', 'Matter', 'title', 1, NULL, 'NONE', NULL, '2026-11-25 09:37:20.927', '2026-11-25 09:37:20.927'),
('96f3f1f5-2f72-4e24-8f72-5e158800fb22', '4189fd31-bd9b-4fce-ad0f-0e859a2cdb7d', '{{Attorney.Name}}', 'ResponsibleAttorney', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:10:10.077', '2026-11-25 09:10:10.077'),
('970cc921-a7cb-469d-9405-8bf92c1e13de', '1aacba72-d077-47f3-b2b7-079f6780add0', '{{Matter.Title}}', 'Matter', 'title', 1, NULL, 'NONE', NULL, '2026-11-25 09:14:44.454', '2026-11-25 09:14:44.454'),
('970d232e-ff9c-426e-9df0-73f42ddc1048', 'f3c5d700-e6d6-4bf5-ab31-1e450d09a991', '{{Client.Name}}', 'Client', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:18:14.290', '2026-11-25 09:18:14.290'),
('975ba482-9a3f-4098-bf81-8c255a7f0508', '60d52c8c-966e-4e95-b691-cbc80e8d385f', '{{Client.Name}}', 'Client', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:39:41.551', '2026-11-25 09:39:41.551'),
('976a71a1-5843-4e72-ae72-7a7bb6afa6bf', '53ff8796-c10e-45df-b002-dfdaf2e6f77a', '{{Attorney.Name}}', 'ResponsibleAttorney', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:16:26.633', '2026-11-25 09:16:26.633'),
('97c42751-3e70-40d0-930f-b4f22cb9798c', '77fbb573-40db-43ef-b3f6-7856e2272e2e', '{{Client.Name}}', 'Client', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:25:46.767', '2026-11-25 09:25:46.767'),
('983b793a-09d1-4da2-b567-1fa889b4c102', 'c09cb221-7da0-4fcd-bc6a-15258f26daf1', '{{Matter.MatterNumber}}', 'Matter', 'matterNumber', 1, NULL, 'NONE', NULL, '2026-11-25 09:43:00.472', '2026-11-25 09:43:00.472'),
('989ff5db-6a0e-4794-9335-f78d5d651c46', 'a5c5977b-441a-4ccb-b7f1-085ce2ccc18f', '{{Insurance.ClaimNumber}}', 'Insurance', 'claimNumber', 0, NULL, 'NONE', NULL, '2026-11-25 09:28:35.656', '2026-11-25 09:28:35.656'),
('98c0ef2e-01ba-4ff5-aa94-cb6882dbf11e', 'f1d31e7b-171b-4abc-85e6-4bfd9332fa65', '{{Client.Name}}', 'Client', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:35:38.301', '2026-11-25 09:35:38.301'),
('98cbf335-6e64-466e-ad9a-fa26199acbca', '88dbdb77-3188-4699-801b-9f4553338ebf', '{{Attorney.Name}}', 'ResponsibleAttorney', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:31:41.857', '2026-11-25 09:31:41.857'),
('98fe8e02-8d56-4510-946a-0272bdae6666', 'b849065e-953a-4107-b563-5df696d006f2', '{{Client.Name}}', 'Client', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:15:19.926', '2026-11-25 09:15:19.926'),
('994f14e5-818c-407a-a517-bb718e3de578', 'c77fdadd-a9dd-4297-a2c5-a67b52493e36', '{{Matter.Title}}', 'Matter', 'title', 1, NULL, 'NONE', NULL, '2026-11-25 09:45:35.888', '2026-11-25 09:45:35.888'),
('9952a940-cb26-4a4c-a4db-5f54e9b46c5f', 'ace0b629-cae7-4260-93af-3643d8d3dd58', '{{Matter.Title}}', 'Matter', 'title', 1, NULL, 'NONE', NULL, '2026-11-25 09:23:14.204', '2026-11-25 09:23:14.204'),
('998c03df-782e-4737-840d-18fbdaf774ca', '1aacba72-d077-47f3-b2b7-079f6780add0', '{{Client.Name}}', 'Client', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:14:44.454', '2026-11-25 09:14:44.454'),
('99bc7842-f710-4c93-ada9-4c8dd7d2522e', 'fdcaea3e-57f2-40dd-ad96-ec8882510a85', '{{Matter.MatterNumber}}', 'Matter', 'matterNumber', 1, NULL, 'NONE', NULL, '2026-11-25 09:29:08.687', '2026-11-25 09:29:08.687'),
('9a05b689-2688-46a5-b931-cda2043a301d', '5dec737b-658f-47fb-9d9c-5f761ab5d42f', '{{Client.Name}}', 'Client', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:30:35.622', '2026-11-25 09:30:35.622'),
('9a3ecfcc-e631-41be-9ea7-ff25a55353ed', '3a8c0d1e-c077-4ffd-a5f3-9771fd6187ab', '{{Attorney.Name}}', 'ResponsibleAttorney', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:28:12.409', '2026-11-25 09:28:12.409'),
('9a4fe8c2-b359-4102-b7b2-67e0185e154f', '743bda6c-ef38-42c4-9876-5bb952ba909e', '{{Matter.Title}}', 'Matter', 'title', 1, NULL, 'NONE', NULL, '2026-11-25 09:37:40.653', '2026-11-25 09:37:40.653'),
('9a6d8ab0-ce7d-41d8-88d0-d63843919774', '863ecb6b-acb2-468e-8280-6869008e38c4', '{{Matter.Title}}', 'Matter', 'title', 1, NULL, 'NONE', NULL, '2026-11-25 09:25:40.453', '2026-11-25 09:25:40.453'),
('9a9852ad-8141-4ba4-be9d-7930216f4699', '8eaaf587-a871-4b9d-ba8a-54e4e38e7234', '{{Matter.Title}}', 'Matter', 'title', 1, NULL, 'NONE', NULL, '2026-11-25 09:41:15.701', '2026-11-25 09:41:15.701'),
('9ac4f31f-8fb4-4102-819d-d25ff00cba0a', '92773fd1-905b-4407-8351-96a284175b55', '{{Matter.MatterNumber}}', 'Matter', 'matterNumber', 1, NULL, 'NONE', NULL, '2026-11-25 09:25:52.825', '2026-11-25 09:25:52.825'),
('9af7f0a9-377c-443b-a214-9b761e7d3a3a', 'c4ec8be5-740c-4049-8d6c-d5e7b3c66983', 'Client.Name', 'Client', 'name', 1, NULL, 'NONE', NULL, '2026-11-14 09:29:59.262', '2026-11-14 09:29:59.262'),
('9b39f090-b229-4d99-b156-8930720ba3d5', '82f334d4-a724-4cf7-834d-e7ffeb29d708', '{{Attorney.Name}}', 'ResponsibleAttorney', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:43:26.986', '2026-11-25 09:43:26.986'),
('9bca5487-e832-4f68-9da7-89287ea8bab6', 'c2303872-a179-4c73-93f2-941c4abcbc6d', '{{Client.Name}}', 'Client', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:24:55.871', '2026-11-25 09:24:55.871'),
('9be196f7-a796-4913-a743-d1347db0276f', 'e7b63652-7194-4fd0-923c-6e5cc1cc7975', '{{Matter.Title}}', 'Matter', 'title', 1, NULL, 'NONE', NULL, '2026-11-25 09:24:10.646', '2026-11-25 09:24:10.646'),
('9be713c4-56e8-4d3c-8b4b-a003a44a7b29', '27f73e77-5dbf-4beb-947f-2cac6003fbd8', '{{Insurance.ClaimNumber}}', 'Insurance', 'claimNumber', 0, NULL, 'NONE', NULL, '2026-11-25 09:12:56.213', '2026-11-25 09:12:56.213'),
('9be7dc6c-9426-42c6-8e9e-619157e819fe', '408fd535-3b97-461c-8322-f60137e1dd85', '{{Client.Name}}', 'Client', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:28:53.764', '2026-11-25 09:28:53.764'),
('9bf38519-b1dc-4405-b8e5-b09a5a52b3cf', '784a0a67-2de8-47ac-bd8f-7b457bd3e5ce', '{{Matter.Title}}', 'Matter', 'title', 1, NULL, 'NONE', NULL, '2026-11-25 09:08:48.958', '2026-11-25 09:08:48.958'),
('9c55df5b-9236-4cdb-8cdf-4e62b3e97fb7', 'ee7a648c-6b21-4a0f-bdc7-1f83084301aa', '{{Client.Name}}', 'Client', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:24:36.756', '2026-11-25 09:24:36.756'),
('9c7cb0a0-89cb-49de-ba2c-dc1109d1f605', '8a427a6e-d37a-4951-8cd6-24e4ed518b16', '{{Attorney.Name}}', 'ResponsibleAttorney', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:29:00.511', '2026-11-25 09:29:00.511'),
('9ca4f4b5-334e-4c76-b2f0-df0ae4bade13', 'f1de25a4-0c3e-4065-8ed5-d194d16ccebd', '{{Attorney.Name}}', 'ResponsibleAttorney', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:18:01.776', '2026-11-25 09:18:01.776'),
('9ca8bff4-68b3-4d09-b2bf-f901d5c2c609', 'df3e25c5-5690-4157-99b0-8313f33d326b', '{{Client.Name}}', 'Client', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:22:27.806', '2026-11-25 09:22:27.806'),
('9cfa25aa-57ba-4d6f-b2c2-bc2dc64cc72e', '9b60b515-2a6b-443d-b1b4-b9be39c9cbff', '{{Client.Name}}', 'Client', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:45:10.533', '2026-11-25 09:45:10.533'),
('9d020cef-9d4d-45a7-9b3b-253238ba27a9', '92773fd1-905b-4407-8351-96a284175b55', '{{Attorney.Name}}', 'ResponsibleAttorney', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:25:52.825', '2026-11-25 09:25:52.825'),
('9d0b6f04-2b21-4167-b234-f0fdf416c055', '9361319b-c01b-4fd1-93fe-140cea9a86b6', '{{Matter.Title}}', 'Matter', 'title', 1, NULL, 'NONE', NULL, '2026-11-25 09:41:02.182', '2026-11-25 09:41:02.182'),
('9d17f085-33ce-4294-8c16-896ba99e3b4b', '88dbdb77-3188-4699-801b-9f4553338ebf', '{{Client.Name}}', 'Client', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:31:41.857', '2026-11-25 09:31:41.857'),
('9d277b97-ea8c-41fa-bb94-a9ebad52283c', 'c1df0c28-85dc-454d-a4b5-8cfa6b73fdae', '{{Matter.Title}}', 'Matter', 'title', 1, NULL, 'NONE', NULL, '2026-11-25 09:39:35.618', '2026-11-25 09:39:35.618'),
('9d445c22-0ea5-41c1-835b-6bd1a01a7a5e', 'f512924e-1ce1-4f7c-8a32-1b102bed96b8', '{{Matter.Title}}', 'Matter', 'title', 1, NULL, 'NONE', NULL, '2026-11-25 09:21:39.574', '2026-11-25 09:21:39.574'),
('9d496074-b0f8-4b11-a4b6-cd1450fada5a', 'cda60690-b708-484d-b818-da492d1ec9f4', '{{Matter.Title}}', 'Matter', 'title', 1, NULL, 'NONE', NULL, '2026-11-25 09:20:00.458', '2026-11-25 09:20:00.458'),
('9d6456bc-998d-443a-838d-22406c2ba5c2', 'bec4931d-f5eb-4ac4-97a7-204023385706', '{{Attorney.Name}}', 'ResponsibleAttorney', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:20:10.391', '2026-11-25 09:20:10.391'),
('9e319e3a-b560-47f4-ad44-545fa2b90996', '1aacba72-d077-47f3-b2b7-079f6780add0', '{{Attorney.Name}}', 'ResponsibleAttorney', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:14:44.454', '2026-11-25 09:14:44.454'),
('9e34830c-0ec3-447d-af82-38830c88f154', '77fbb573-40db-43ef-b3f6-7856e2272e2e', '{{Attorney.Name}}', 'ResponsibleAttorney', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:25:46.767', '2026-11-25 09:25:46.767'),
('9e4a5e7a-8c51-4ab3-967e-93e0d622f8ba', 'c817370e-6a7c-4971-9a06-d1d243a3249e', '{{Matter.Title}}', 'Matter', 'title', 1, NULL, 'NONE', NULL, '2026-11-25 09:17:41.650', '2026-11-25 09:17:41.650'),
('9e508cdf-8e21-492c-aeff-8de1adbdfbf1', 'd24c9473-cba3-4708-a4ef-3e4fb5ed825c', '{{Attorney.Name}}', 'ResponsibleAttorney', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:38:28.453', '2026-11-25 09:38:28.453'),
('9e56b2c4-03bb-4461-9958-67f192e30766', 'a7c0d570-e431-4c48-b4ef-aef8546890ea', '{{Matter.MatterNumber}}', 'Matter', 'matterNumber', 1, NULL, 'NONE', NULL, '2026-11-25 09:16:59.935', '2026-11-25 09:16:59.935'),
('9e9c6b33-5f21-4ed8-9c86-39c5e77ca871', 'ffd84a63-15dd-4736-ac53-3cdf07c061d1', '{{Matter.MatterNumber}}', 'Matter', 'matterNumber', 1, NULL, 'NONE', NULL, '2026-11-25 09:06:41.631', '2026-11-25 09:06:41.631'),
('9eaf7abd-8857-4b61-8eb8-e7c81a64b0e1', '457c84fb-c3d9-485b-8f89-ed18a04371b7', '{{Matter.MatterNumber}}', 'Matter', 'matterNumber', 1, NULL, 'NONE', NULL, '2026-11-25 09:19:11.121', '2026-11-25 09:19:11.121'),
('9f38f7f1-4e3f-453c-95f1-d5a99ca0d1d7', '5c908fec-6fd2-4583-8543-7d9d3047abc0', '{{Client.Name}}', 'Client', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:33:57.709', '2026-11-25 09:33:57.709'),
('9f48211b-4865-4f60-bb36-c1bd2cc50833', '5d439c99-f896-4a7f-99e9-3f7c2bf237a9', '{{CurrentDate.Long}}', 'CurrentDate', 'long', 0, NULL, 'NONE', NULL, '2026-11-25 09:20:48.401', '2026-11-25 09:20:48.401'),
('9f5017a8-32d6-4a51-b9ce-d0b1bc4df429', 'd795264a-186b-4ff7-90ce-a6483dbb71ee', '{{Matter.Title}}', 'Matter', 'title', 1, NULL, 'NONE', NULL, '2026-11-25 09:42:01.887', '2026-11-25 09:42:01.887'),
('9f855b38-c1b4-41f6-a7bd-ddeb53d90315', '77fcdc30-31b1-4157-a660-84554edc5518', '{{Matter.Title}}', 'Matter', 'title', 1, NULL, 'NONE', NULL, '2026-11-25 09:20:17.652', '2026-11-25 09:20:17.652'),
('9fb576f1-86c0-4b91-b5b7-5e9cdde3cfae', '836e1674-9f3e-4b15-bbdf-71e9f39cf358', '{{Attorney.Name}}', 'ResponsibleAttorney', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:22:21.046', '2026-11-25 09:22:21.046'),
('a02f3fdf-6d69-4955-aa29-2a696e73c0d4', '673e6316-9e22-4650-8bbc-f87f1a2f7e3a', '{{Attorney.Name}}', 'ResponsibleAttorney', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:25:21.556', '2026-11-25 09:25:21.556'),
('a038c3f7-a972-4f2b-a043-439d7f4b22fe', 'a2db730d-4dbc-4106-919b-fc0360d36f16', '{{Matter.MatterNumber}}', 'Matter', 'matterNumber', 1, NULL, 'NONE', NULL, '2026-11-25 09:17:25.046', '2026-11-25 09:17:25.046'),
('a05492a8-5aa8-4b30-b489-4b9054b69cf8', '89f74c3f-b3dc-479d-808f-a199f5f4480c', '{{Matter.Title}}', 'Matter', 'title', 1, NULL, 'NONE', NULL, '2026-11-25 09:38:34.336', '2026-11-25 09:38:34.336'),
('a0670672-c7aa-4534-af3b-d39b5348398d', 'e69186ac-46bc-4fea-82bf-e9bd834342ac', '{{Matter.Title}}', 'Matter', 'title', 1, NULL, 'NONE', NULL, '2026-11-25 09:15:11.521', '2026-11-25 09:15:11.521'),
('a07128a8-b028-4af7-8919-7249a06cacf8', 'ab0ef57c-1551-4441-b538-de13cf647a2b', '{{Matter.Title}}', 'Matter', 'title', 1, NULL, 'NONE', NULL, '2026-11-25 09:08:39.470', '2026-11-25 09:08:39.470'),
('a0817937-d80f-4389-85f3-277ca5d1552d', 'd554bfda-8bce-4121-a8fa-a94f5da56ba5', 'Client.Name', 'Client', 'name', 1, NULL, 'NONE', NULL, '2026-11-14 09:29:36.759', '2026-11-14 09:29:36.759'),
('a0ecf31a-b7e0-4e2d-94a1-d0b413b9dfe3', 'e157fff3-b830-4744-a7ea-4f78cc3f88ee', '{{Matter.Title}}', 'Matter', 'title', 1, NULL, 'NONE', NULL, '2026-11-25 09:17:33.084', '2026-11-25 09:17:33.084'),
('a1e9a910-960f-43b5-bc98-2f63152adfb0', 'a1ae9879-d795-4d25-b0fc-2536ccb1031e', '{{Client.Name}}', 'Client', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:12:38.790', '2026-11-25 09:12:38.790'),
('a1f4b64f-a27f-4335-ae13-ff08b6ed9828', 'ee7a648c-6b21-4a0f-bdc7-1f83084301aa', '{{Matter.MatterNumber}}', 'Matter', 'matterNumber', 1, NULL, 'NONE', NULL, '2026-11-25 09:24:36.756', '2026-11-25 09:24:36.756'),
('a1f55ef6-a824-41e3-b3b0-559a5bb2df43', 'c5ce2bf6-f9cf-464a-b12a-e34c4d9749cc', '{{Matter.Title}}', 'Matter', 'title', 1, NULL, 'NONE', NULL, '2026-11-25 09:28:17.723', '2026-11-25 09:28:17.723'),
('a233bdb9-e3db-43c7-b846-b68a2a427def', '743bda6c-ef38-42c4-9876-5bb952ba909e', '{{CurrentDate.Long}}', 'CurrentDate', 'long', 0, NULL, 'NONE', NULL, '2026-11-25 09:37:40.653', '2026-11-25 09:37:40.653'),
('a2b364e0-c50c-4666-b4cf-edf54737a34f', 'cc5d287b-035c-4bbb-8ad8-7cc0051ffb46', '{{Client.Name}}', 'Client', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:30:52.249', '2026-11-25 09:30:52.249'),
('a2eb815d-f19c-46e0-b0a4-f56542fab577', 'd220f2ef-879d-4a4c-baa4-9701c3f16d60', '{{Insurance.CarrierName}}', 'Insurance', 'insuranceCompany', 0, NULL, 'NONE', NULL, '2026-11-25 09:20:32.818', '2026-11-25 09:20:32.818'),
('a2f7bbae-7e61-4079-9163-7aaf81ec1d92', 'aae04ae9-b293-4539-a12a-781f0d71b8d1', '{{Attorney.Name}}', 'ResponsibleAttorney', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:13:38.494', '2026-11-25 09:13:38.494'),
('a3281a41-5910-4838-a9b9-b7ea084b0035', '9361319b-c01b-4fd1-93fe-140cea9a86b6', '{{Matter.MatterNumber}}', 'Matter', 'matterNumber', 1, NULL, 'NONE', NULL, '2026-11-25 09:41:02.182', '2026-11-25 09:41:02.182'),
('a32eca8c-4fb7-4f25-bb7b-1648dfca68df', 'eaf9c42d-fa49-4e7f-97e9-106ed7ac79ba', '{{Incident.AccidentDate}}', 'Incident', 'accidentDate', 0, NULL, 'DATE_LONG', NULL, '2026-11-25 09:12:19.440', '2026-11-25 09:12:19.440'),
('a32ff17e-270d-407a-a744-0f1db2c8ecce', '89b37ce7-9d86-4a99-883a-8c5506774e9a', '{{Attorney.Name}}', 'ResponsibleAttorney', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:19:44.491', '2026-11-25 09:19:44.491'),
('a386c148-8c73-42a6-bcbf-bb412dd07f36', '512ed74f-1f59-4a55-bbb2-348dc6dc277e', '{{MedicalProvider.Name}}', 'MedicalProvider', 'name', 0, NULL, 'NONE', NULL, '2026-11-25 09:22:59.548', '2026-11-25 09:22:59.548'),
('a3ba24e6-1104-4514-ae62-982030ed89ac', 'c77fdadd-a9dd-4297-a2c5-a67b52493e36', '{{Attorney.Name}}', 'ResponsibleAttorney', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:45:35.888', '2026-11-25 09:45:35.888'),
('a3ea36a9-25c4-4574-8794-534dc735c49f', 'f044998e-94c8-4a24-8776-9ffddfc146af', '{{Attorney.Name}}', 'ResponsibleAttorney', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:40:49.866', '2026-11-25 09:40:49.866'),
('a418fe44-777b-465d-8fde-a44422a766dd', '14fc15d3-97ad-4511-8d69-9173305d7e50', '{{Matter.MatterNumber}}', 'Matter', 'matterNumber', 1, NULL, 'NONE', NULL, '2026-11-25 09:35:06.952', '2026-11-25 09:35:06.952'),
('a44e5235-0f1a-4be1-b31f-90ba67e7d2d6', '5347a9ab-7278-4647-bdd5-13d174237f64', '{{Matter.Title}}', 'Matter', 'title', 1, NULL, 'NONE', NULL, '2026-11-25 09:34:29.597', '2026-11-25 09:34:29.597'),
('a4a1bac6-900d-4c32-aef4-c44be35f07da', '58cfe8c5-ef3d-4a4a-b367-577985a01b75', 'Client.Name', 'Client', 'name', 1, NULL, 'NONE', NULL, '2026-11-14 09:29:43.932', '2026-11-14 09:29:43.932'),
('a4ee0ee7-cd80-429f-b9ce-4bf4f5895c9a', '25531579-7684-49e9-ab21-c54085ab9f06', '{{Client.Name}}', 'Client', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:33:15.311', '2026-11-25 09:33:15.311'),
('a4f30526-a642-4c19-b3c5-7f9cc2aed30a', '4bbb16ac-a0c8-4ead-87b5-1d3fd4c9997c', '{{Matter.Title}}', 'Matter', 'title', 1, NULL, 'NONE', NULL, '2026-11-25 09:41:23.875', '2026-11-25 09:41:23.875'),
('a4fbd973-c0e2-47e7-a286-28f436fa0b0e', 'd7c3f728-e7aa-4abb-82e1-b77e855808b2', '{{Attorney.Name}}', 'ResponsibleAttorney', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:36:33.810', '2026-11-25 09:36:33.810'),
('a513c832-8d10-4106-8407-c2ccb812c49b', 'fb08ce84-4c18-4837-b721-a23609d55a88', '{{Matter.MatterNumber}}', 'Matter', 'matterNumber', 1, NULL, 'NONE', NULL, '2026-11-25 09:07:54.843', '2026-11-25 09:07:54.843'),
('a5353f79-43b7-46c0-8f59-ce3d04d4bef4', '27f73e77-5dbf-4beb-947f-2cac6003fbd8', '{{Client.Name}}', 'Client', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:12:56.213', '2026-11-25 09:12:56.213'),
('a550e6fa-00c4-42ff-bfe9-8a41dc994252', 'd220f2ef-879d-4a4c-baa4-9701c3f16d60', '{{Client.Name}}', 'Client', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:20:32.818', '2026-11-25 09:20:32.818'),
('a55380b9-1faf-4131-8e14-1922c5ab8711', 'e4b91c44-5bb0-4497-85c2-1ea00f432aca', '{{Attorney.Name}}', 'ResponsibleAttorney', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:43:42.925', '2026-11-25 09:43:42.925'),
('a563e335-ad43-4ea5-92fb-c62d7bb9aa99', '17b2f3bb-0fbb-4884-a827-24f65dc7b81e', '{{Matter.MatterNumber}}', 'Matter', 'matterNumber', 1, NULL, 'NONE', NULL, '2026-11-25 09:15:27.042', '2026-11-25 09:15:27.042'),
('a5848122-c5f3-4159-91f6-6cdc5560854d', '2f5620bd-ff68-4eda-8b79-fe8f49ae40db', '{{Attorney.Name}}', 'ResponsibleAttorney', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:34:22.712', '2026-11-25 09:34:22.712'),
('a622b364-63c6-4bc4-90f2-bbdb41ac1a50', '3518a797-b578-4ecf-90f0-c21e436d54ed', '{{Matter.MatterNumber}}', 'Matter', 'matterNumber', 1, NULL, 'NONE', NULL, '2026-11-25 09:16:53.697', '2026-11-25 09:16:53.697'),
('a64c2fde-7ce4-495b-ba9e-44f0f0203acf', 'a25a6d17-8108-426c-84a8-84dddb0d4e14', '{{Client.Name}}', 'Client', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:18:08.122', '2026-11-25 09:18:08.122'),
('a684af8f-72f5-4220-b727-d05d91744191', '8ae67bb4-028f-4dfb-8a6b-bce202e8f897', '{{Attorney.Name}}', 'ResponsibleAttorney', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:18:57.448', '2026-11-25 09:18:57.448'),
('a78f434e-114f-4ba8-9873-20f8979f5ca5', '8550fd39-39c9-46e4-ac0d-b95d3ed4d125', '{{Matter.MatterNumber}}', 'Matter', 'matterNumber', 1, NULL, 'NONE', NULL, '2026-11-25 09:36:56.022', '2026-11-25 09:36:56.022'),
('a7a911c5-fe2b-4c20-a7c1-5f92e3ad3fda', '3a8c0d1e-c077-4ffd-a5f3-9771fd6187ab', '{{Court.Name}}', 'Court', 'name', 0, NULL, 'NONE', NULL, '2026-11-25 09:28:12.409', '2026-11-25 09:28:12.409'),
('a817c21a-4d6c-4b91-a391-fea1cea3bbec', '19b4ea63-d6fe-4c78-a4aa-4e15274d8020', '{{Attorney.Name}}', 'ResponsibleAttorney', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:39:14.262', '2026-11-25 09:39:14.262'),
('a836d35a-61c0-4175-b3f7-1501621b9d35', '4a8557bf-69eb-447c-b559-e45c3ee6584d', '{{Attorney.Name}}', 'ResponsibleAttorney', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:43:19.390', '2026-11-25 09:43:19.390'),
('a855d57f-ce69-4706-b94f-719c5c78487f', '673e6316-9e22-4650-8bbc-f87f1a2f7e3a', '{{Demand.DemandedAmount}}', 'Demand', 'demandedAmount', 0, NULL, 'CURRENCY_USD', NULL, '2026-11-25 09:25:21.556', '2026-11-25 09:25:21.556'),
('a8689663-d5c3-4ec5-88ec-9821b9da7fae', '94dfbc9b-cc38-442f-801b-f9c7ffc02668', '{{Client.Name}}', 'Client', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:17:48.644', '2026-11-25 09:17:48.644'),
('a8835623-fd82-4627-9e4e-160dab2346fe', '5361481e-129a-40d6-9934-520daeffbe6a', '{{Attorney.Name}}', 'ResponsibleAttorney', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:32:09.257', '2026-11-25 09:32:09.257'),
('a8888c28-bd6b-4ecd-b804-8037b26d4b3b', '241fd3a3-0135-4a8b-a617-c23cdff79820', '{{Client.Name}}', 'Client', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:33:50.854', '2026-11-25 09:33:50.854'),
('a8a1be14-6059-4cf2-8127-0d3426b769e0', '1bcd0da5-4d16-4f30-8022-024a77ac0d02', '{{Matter.MatterNumber}}', 'Matter', 'matterNumber', 1, NULL, 'NONE', NULL, '2026-11-25 09:38:22.229', '2026-11-25 09:38:22.229'),
('a8f65bee-940a-4d9a-adac-87b82d4d2ee5', 'a0952cf1-1670-4189-8513-382751260037', '{{CurrentDate.Long}}', 'CurrentDate', 'long', 0, NULL, 'NONE', NULL, '2026-11-25 09:43:07.970', '2026-11-25 09:43:07.970'),
('a90eedfb-e01a-4e48-a892-698eab226f57', '29d5db33-4c61-43b3-b55c-5ca8253f38e0', '{{Client.Name}}', 'Client', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:18:20.075', '2026-11-25 09:18:20.075'),
('a9277169-f16e-4536-bd1c-77d1200cfaaf', '60d1ffef-c3d2-4057-9737-b1eae70d5f43', '{{Matter.Title}}', 'Matter', 'title', 1, NULL, 'NONE', NULL, '2026-11-25 09:29:31.214', '2026-11-25 09:29:31.214'),
('a96c075a-e113-41c2-95ec-2929b211a7c8', 'c817370e-6a7c-4971-9a06-d1d243a3249e', '{{Client.Name}}', 'Client', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:17:41.650', '2026-11-25 09:17:41.650'),
('a96eacb3-7773-4596-8eb7-92e03bd879c7', '6e54ec21-da29-449d-bae3-5e59a42baf6b', '{{Client.Name}}', 'Client', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:36:41.403', '2026-11-25 09:36:41.403'),
('a97badc8-3496-4693-9691-faa51e32ed23', 'a6c30529-d5fe-4ef6-88f7-5646308ae386', '{{Attorney.Name}}', 'ResponsibleAttorney', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:30:28.757', '2026-11-25 09:30:28.757'),
('aa780419-9fa0-4415-880d-2e773a4cea36', 'a96ffd2f-f9c7-45bb-ac53-791da9d25353', '{{Matter.MatterNumber}}', 'Matter', 'matterNumber', 1, NULL, 'NONE', NULL, '2026-11-25 09:27:27.990', '2026-11-25 09:27:27.990'),
('aa8e891e-4ecf-4307-91aa-ebd1faef4da6', '50a5e530-ac91-4503-a883-e3f98ebcb26a', '{{Matter.Title}}', 'Matter', 'title', 1, NULL, 'NONE', NULL, '2026-11-25 09:16:46.597', '2026-11-25 09:16:46.597'),
('aad6afd2-de80-46ba-abae-7d665f6dc2f1', '89bfc8b5-afc6-4a24-a9fd-f558824dc2c7', '{{Matter.Title}}', 'Matter', 'title', 1, NULL, 'NONE', NULL, '2026-11-25 09:38:43.357', '2026-11-25 09:38:43.357'),
('aaddf98b-da54-47a5-a89f-05cb845808cf', '5e4e18a0-301e-4bb3-865b-43e3f87e3ac7', '{{Matter.Title}}', 'Matter', 'title', 1, NULL, 'NONE', NULL, '2026-11-25 09:09:59.969', '2026-11-25 09:09:59.969'),
('aaf91b10-1e5e-4daf-b9e9-b08cd2bbad77', '95774654-8970-47c7-98f5-5b016d390ff1', '{{Matter.MatterNumber}}', 'Matter', 'matterNumber', 1, NULL, 'NONE', NULL, '2026-11-25 09:44:07.839', '2026-11-25 09:44:07.839'),
('aafb76d7-79de-4131-a17b-9a0847a694e5', '8f2d0739-761d-4c01-ade2-bfdd100e7001', '{{Matter.Title}}', 'Matter', 'title', 1, NULL, 'NONE', NULL, '2026-11-25 09:23:37.028', '2026-11-25 09:23:37.028'),
('ab03e0ea-936d-47bc-8555-fcd8b2f6ff5f', '1bcd8d6e-d341-40f2-a658-171ab595c104', '{{Matter.Title}}', 'Matter', 'title', 1, NULL, 'NONE', NULL, '2026-11-25 09:42:38.075', '2026-11-25 09:42:38.075'),
('ab2fdbc9-92f4-42a9-bad4-3ac877ada498', '042435a0-f2fb-4811-891e-e9feb57900f1', '{{Client.Name}}', 'Client', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:25:28.318', '2026-11-25 09:25:28.318'),
('ab361e39-a96a-49f5-bdd8-4c8f057585a2', '34590700-cfd8-4fe4-bbd5-8519dee10003', '{{Client.Name}}', 'Client', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:37:15.408', '2026-11-25 09:37:15.408'),
('ab83b35d-e441-4d61-a471-c607a2c0dff3', 'c4ec8be5-740c-4049-8d6c-d5e7b3c66983', 'Matter.MatterNumber', 'Matter', 'matterNumber', 1, NULL, 'NONE', NULL, '2026-11-14 09:29:59.262', '2026-11-14 09:29:59.262'),
('abe0b1ac-44e2-451c-8abb-66dbdccb4715', '76a7a39b-0455-4895-8841-3f04be9358e1', '{{Matter.MatterNumber}}', 'Matter', 'matterNumber', 1, NULL, 'NONE', NULL, '2026-11-25 09:45:23.110', '2026-11-25 09:45:23.110'),
('abfa7895-a66e-46aa-ae33-cc922fa7874e', '46f31fd0-867e-4edf-bacc-1923e699b8ac', '{{Matter.MatterNumber}}', 'Matter', 'matterNumber', 1, NULL, 'NONE', NULL, '2026-11-25 09:10:46.357', '2026-11-25 09:10:46.357'),
('ac0663d2-5518-4732-a94c-25a7021960b8', '7e30837a-d454-41ca-9705-e2a4f1ceccf7', '{{Matter.Title}}', 'Matter', 'title', 1, NULL, 'NONE', NULL, '2026-11-25 09:43:52.167', '2026-11-25 09:43:52.167'),
('ac40839d-aa36-4cd2-a79b-e600cf570b1f', '3a8c0d1e-c077-4ffd-a5f3-9771fd6187ab', '{{Client.Name}}', 'Client', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:28:12.409', '2026-11-25 09:28:12.409'),
('ac5a4f1c-366a-40dc-a6b1-779095d39ac2', '592f3f30-cc15-4dbf-8cbe-976516e0ea61', '{{Client.Name}}', 'Client', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:39:20.650', '2026-11-25 09:39:20.650'),
('ad449d88-5686-4cb4-8ca1-d542f8785b5f', 'd7c3f728-e7aa-4abb-82e1-b77e855808b2', '{{Matter.MatterNumber}}', 'Matter', 'matterNumber', 1, NULL, 'NONE', NULL, '2026-11-25 09:36:33.810', '2026-11-25 09:36:33.810'),
('adb59e87-fc4b-48e8-aed1-1d53401c123a', '8f2d0739-761d-4c01-ade2-bfdd100e7001', '{{Matter.MatterNumber}}', 'Matter', 'matterNumber', 1, NULL, 'NONE', NULL, '2026-11-25 09:23:37.028', '2026-11-25 09:23:37.028'),
('adef15a2-d180-4f04-941b-344eebe72b91', '89f74c3f-b3dc-479d-808f-a199f5f4480c', '{{Client.Name}}', 'Client', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:38:34.336', '2026-11-25 09:38:34.336'),
('adff5e3d-25ea-4486-aaac-417a759f0dd2', '77fcdc30-31b1-4157-a660-84554edc5518', '{{Matter.MatterNumber}}', 'Matter', 'matterNumber', 1, NULL, 'NONE', NULL, '2026-11-25 09:20:17.652', '2026-11-25 09:20:17.652'),
('ae0add4d-2c4a-43c9-b1a3-e58511597eec', '3cdd654e-d99e-42e9-a77a-8687e4163a1f', '{{Attorney.Name}}', 'ResponsibleAttorney', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:11:47.534', '2026-11-25 09:11:47.534'),
('ae46a298-0299-438b-be8d-37738b0d09db', '5bfb7b62-bdf1-4121-be46-0f8efa189962', '{{Attorney.Name}}', 'ResponsibleAttorney', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:40:22.102', '2026-11-25 09:40:22.102'),
('ae72e12b-220c-4dd6-b667-83b5102833b6', 'fdcaea3e-57f2-40dd-ad96-ec8882510a85', '{{Matter.Title}}', 'Matter', 'title', 1, NULL, 'NONE', NULL, '2026-11-25 09:29:08.687', '2026-11-25 09:29:08.687'),
('ae730989-44de-43f2-95c6-f85c5f87e8ed', '5da49101-918d-4970-8839-06070643f366', '{{Matter.MatterNumber}}', 'Matter', 'matterNumber', 1, NULL, 'NONE', NULL, '2026-11-25 09:24:30.718', '2026-11-25 09:24:30.718'),
('aea590d0-55b3-462a-adbb-fe0275e30be7', '25cda274-07df-4c65-88da-f1ff8e45e0dd', '{{Incident.AccidentDate}}', 'Incident', 'accidentDate', 0, NULL, 'DATE_LONG', NULL, '2026-11-25 09:22:36.613', '2026-11-25 09:22:36.613'),
('aee1bf15-a55a-4471-aa75-3b1696eb27c6', '956862a8-e05a-49d7-a431-f8d353503fb7', '{{Matter.MatterNumber}}', 'Matter', 'matterNumber', 1, NULL, 'NONE', NULL, '2026-11-25 09:26:29.801', '2026-11-25 09:26:29.801'),
('af03ac7e-3b96-48c7-bdd0-eb869e8e0642', 'f57ee915-26c8-4404-b8af-6a03e2a7cb59', '{{Matter.MatterNumber}}', 'Matter', 'matterNumber', 1, NULL, 'NONE', NULL, '2026-11-25 09:40:41.743', '2026-11-25 09:40:41.743'),
('af20ee1e-5d9c-4619-b517-8291e617e7fc', 'ef522887-592a-4660-91a0-efe24715406f', '{{Matter.Title}}', 'Matter', 'title', 1, NULL, 'NONE', NULL, '2026-11-25 09:09:43.379', '2026-11-25 09:09:43.379'),
('af2acc6a-cca4-4115-8389-4457bab820c6', '1502c247-62a3-4463-81ad-ca1409cdd1a9', '{{Client.Name}}', 'Client', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:27:01.396', '2026-11-25 09:27:01.396'),
('af82542c-5979-430d-92d5-c6c89cdbb1aa', '0015843c-7e56-4ddd-8825-b5d85bc450df', '{{Attorney.Name}}', 'ResponsibleAttorney', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:26:37.754', '2026-11-25 09:26:37.754'),
('afe7b2e0-0c8e-4ec3-9b08-99d978ee3202', '852400e2-7592-4ca8-a194-fbc1bf456fb1', '{{Matter.MatterNumber}}', 'Matter', 'matterNumber', 1, NULL, 'NONE', NULL, '2026-11-25 09:42:52.489', '2026-11-25 09:42:52.489'),
('b02ae383-e58e-4fb3-b3a4-497fc5c1db98', '27f73e77-5dbf-4beb-947f-2cac6003fbd8', '{{Matter.MatterNumber}}', 'Matter', 'matterNumber', 1, NULL, 'NONE', NULL, '2026-11-25 09:12:56.213', '2026-11-25 09:12:56.213'),
('b04eda30-1c4e-459c-9ff2-e31a33401380', '3dcceccc-1e07-4dd6-8f21-e7a09f064265', '{{Client.Name}}', 'Client', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:12:01.509', '2026-11-25 09:12:01.509'),
('b0640516-ab11-46f0-9276-e874ecd8acd0', 'a7c0d570-e431-4c48-b4ef-aef8546890ea', '{{Attorney.Name}}', 'ResponsibleAttorney', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:16:59.935', '2026-11-25 09:16:59.935'),
('b0cd8fe1-cd61-4050-8f9e-a15af4261e34', 'a7c0d570-e431-4c48-b4ef-aef8546890ea', '{{Matter.Title}}', 'Matter', 'title', 1, NULL, 'NONE', NULL, '2026-11-25 09:16:59.935', '2026-11-25 09:16:59.935'),
('b1113c54-2f2d-4b8e-9a76-c00866553cf8', '38dfc741-2eb3-490f-aee9-85ee6a82c9f5', '{{Matter.MatterNumber}}', 'Matter', 'matterNumber', 1, NULL, 'NONE', NULL, '2026-11-25 09:35:22.673', '2026-11-25 09:35:22.673'),
('b177e73c-36a5-48e2-8ced-9b23dec585e8', '3fb28c83-bc70-4ab4-a3d7-b19b4e664c6e', '{{Attorney.Name}}', 'ResponsibleAttorney', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:35:30.628', '2026-11-25 09:35:30.628'),
('b1a6fed2-7e24-4162-91cd-52b4ce783762', '1c7b9b3b-4466-45fa-994b-f2cc4e40070d', '{{Client.Name}}', 'Client', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:30:11.806', '2026-11-25 09:30:11.806'),
('b1ddb49b-1c6f-45e5-aac6-63e42b3ece5e', '114c5862-b73f-48ee-a72c-615ed35537b3', '{{Attorney.Name}}', 'ResponsibleAttorney', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:24:04.682', '2026-11-25 09:24:04.682'),
('b1df5f62-ce06-41b4-b0ea-3f043be16fab', '2f5620bd-ff68-4eda-8b79-fe8f49ae40db', '{{Client.Name}}', 'Client', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:34:22.712', '2026-11-25 09:34:22.712'),
('b1e6eaa1-08a5-4c4b-89af-d17cdccbe3fb', 'f3c5d700-e6d6-4bf5-ab31-1e450d09a991', '{{Matter.MatterNumber}}', 'Matter', 'matterNumber', 1, NULL, 'NONE', NULL, '2026-11-25 09:18:14.290', '2026-11-25 09:18:14.290'),
('b1eee8bb-991b-406a-ac54-591fd30f5907', 'b3fa3129-564d-4926-a813-3f343805c94e', '{{Matter.MatterNumber}}', 'Matter', 'matterNumber', 1, NULL, 'NONE', NULL, '2026-11-25 09:15:02.998', '2026-11-25 09:15:02.998'),
('b2053514-3321-46d2-91af-c8a7f6400f17', 'ace0b629-cae7-4260-93af-3643d8d3dd58', '{{Client.Name}}', 'Client', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:23:14.204', '2026-11-25 09:23:14.204'),
('b225edd8-c212-44b0-9e79-29c44b074c06', '24be09a7-7d8c-4d14-a6ad-4438cf0d12d8', '{{Client.Name}}', 'Client', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:28:22.849', '2026-11-25 09:28:22.849'),
('b27fa73c-4719-40ea-b9a7-36ae3785acb3', '592f3f30-cc15-4dbf-8cbe-976516e0ea61', '{{Matter.MatterNumber}}', 'Matter', 'matterNumber', 1, NULL, 'NONE', NULL, '2026-11-25 09:39:20.650', '2026-11-25 09:39:20.650'),
('b2d34088-91c7-44ca-b648-97ce9b12a181', '96e98b6c-5022-4a6a-8538-45dea007ec14', '{{Client.Name}}', 'Client', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:30:03.286', '2026-11-25 09:30:03.286'),
('b30bc3a3-3026-4b50-b9e6-26319230dd50', '25531579-7684-49e9-ab21-c54085ab9f06', '{{Matter.MatterNumber}}', 'Matter', 'matterNumber', 1, NULL, 'NONE', NULL, '2026-11-25 09:33:15.311', '2026-11-25 09:33:15.311'),
('b347b22b-9747-4a6a-a18f-f92ad1bad55d', 'e157fff3-b830-4744-a7ea-4f78cc3f88ee', '{{Attorney.Name}}', 'ResponsibleAttorney', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:17:33.084', '2026-11-25 09:17:33.084'),
('b34e7bee-d79f-43e0-805f-712e41b85363', 'd26b2d0a-875b-440e-bdd0-98d209b395f6', '{{Matter.MatterNumber}}', 'Matter', 'matterNumber', 1, NULL, 'NONE', NULL, '2026-11-25 09:21:57.086', '2026-11-25 09:21:57.086'),
('b35e93a8-9175-4bc6-9163-5990d5cd9f2a', '25531579-7684-49e9-ab21-c54085ab9f06', '{{Matter.Title}}', 'Matter', 'title', 1, NULL, 'NONE', NULL, '2026-11-25 09:33:15.311', '2026-11-25 09:33:15.311'),
('b369f6a8-f91d-4629-aeb4-435e5712eb3c', '1ec6c840-2b23-40bf-a2ae-7145c973e095', '{{Matter.Title}}', 'Matter', 'title', 1, NULL, 'NONE', NULL, '2026-11-25 09:41:39.010', '2026-11-25 09:41:39.010'),
('b3a81316-99b5-40db-80e7-d17fc8c21bfe', '512ed74f-1f59-4a55-bbb2-348dc6dc277e', '{{Attorney.Name}}', 'ResponsibleAttorney', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:22:59.548', '2026-11-25 09:22:59.548'),
('b3c31e8a-07e8-492e-b991-d2eacb99621a', '512ed74f-1f59-4a55-bbb2-348dc6dc277e', '{{Client.Name}}', 'Client', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:22:59.548', '2026-11-25 09:22:59.548'),
('b3ec4489-a1ca-4f4d-8f40-917f16e9af1e', '1502c247-62a3-4463-81ad-ca1409cdd1a9', '{{Attorney.Name}}', 'ResponsibleAttorney', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:27:01.396', '2026-11-25 09:27:01.396'),
('b3eea1d6-289c-4507-9f6b-00678ea7f39a', 'c13d06b7-cb6f-4b97-9815-76bbe6828bf1', '{{Client.Name}}', 'Client', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:33:09.779', '2026-11-25 09:33:09.779'),
('b3f84f16-f749-42ca-abba-80ff97788210', 'bdca2373-61f4-4959-92a9-51597dde69c2', '{{Court.Name}}', 'Court', 'name', 0, NULL, 'NONE', NULL, '2026-11-25 09:24:25.273', '2026-11-25 09:24:25.273'),
('b3fc4ca9-9b69-458b-9525-0f1e5640eaf6', '6e54ec21-da29-449d-bae3-5e59a42baf6b', '{{Attorney.Name}}', 'ResponsibleAttorney', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:36:41.403', '2026-11-25 09:36:41.403'),
('b40165be-74ad-42e4-afec-826d4deaaf29', '3a8c0d1e-c077-4ffd-a5f3-9771fd6187ab', '{{Matter.Title}}', 'Matter', 'title', 1, NULL, 'NONE', NULL, '2026-11-25 09:28:12.409', '2026-11-25 09:28:12.409'),
('b408199d-3a5e-462c-8213-1cae20e851a9', '91dfe486-8f7a-471b-a46a-742db2f4e416', '{{Attorney.Name}}', 'ResponsibleAttorney', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:08:30.402', '2026-11-25 09:08:30.402'),
('b41d4811-852d-4ac9-a6db-7b369c2b4d2f', 'aae4c646-eab5-45dd-97ce-81bb12c1077d', '{{Client.Name}}', 'Client', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:31:24.862', '2026-11-25 09:31:24.862'),
('b483ffd2-7eeb-47b4-93d6-e9e179f1ef7c', '689ca019-7b8a-40f6-8175-1c027a48a5cd', '{{Attorney.Name}}', 'ResponsibleAttorney', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:32:26.150', '2026-11-25 09:32:26.150'),
('b4f74eb2-fc03-4f05-9665-bbe2e8e3b779', '5bfb7b62-bdf1-4121-be46-0f8efa189962', '{{Matter.MatterNumber}}', 'Matter', 'matterNumber', 1, NULL, 'NONE', NULL, '2026-11-25 09:40:22.102', '2026-11-25 09:40:22.102'),
('b5183648-360f-4794-96e1-3fb38c18d867', 'd6d12dd8-f5fc-4ea7-947f-a57f919d757f', '{{Client.Name}}', 'Client', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:17:16.922', '2026-11-25 09:17:16.922'),
('b51b57e6-d18e-4966-bfa8-0dd964ed812a', '6cf69812-251b-4c6b-a300-5f54eef3c0c5', '{{Matter.MatterNumber}}', 'Matter', 'matterNumber', 1, NULL, 'NONE', NULL, '2026-11-25 09:26:14.955', '2026-11-25 09:26:14.955'),
('b54ac790-1f1b-4246-a591-f92796eb790a', '7402b6b9-9787-4ceb-8664-88ca07ac3156', '{{Matter.MatterNumber}}', 'Matter', 'matterNumber', 1, NULL, 'NONE', NULL, '2026-11-25 09:23:50.365', '2026-11-25 09:23:50.365'),
('b5795fa2-8b49-42e0-bf99-98568d530239', '941ada6d-d6b6-4a4e-aef6-310034619304', '{{Matter.Title}}', 'Matter', 'title', 1, NULL, 'NONE', NULL, '2026-11-25 09:40:01.513', '2026-11-25 09:40:01.513'),
('b5a147a0-f609-4865-8bf8-6342048a62cb', '24be09a7-7d8c-4d14-a6ad-4438cf0d12d8', '{{Matter.MatterNumber}}', 'Matter', 'matterNumber', 1, NULL, 'NONE', NULL, '2026-11-25 09:28:22.849', '2026-11-25 09:28:22.849'),
('b5cc4ecc-4278-4363-9d74-2bf4ba3cd519', '8f2d0739-761d-4c01-ade2-bfdd100e7001', '{{CurrentDate.Long}}', 'CurrentDate', 'long', 0, NULL, 'NONE', NULL, '2026-11-25 09:23:37.028', '2026-11-25 09:23:37.028'),
('b5de4a1f-f18b-4e75-984d-8af3a3688b8b', '4189fd31-bd9b-4fce-ad0f-0e859a2cdb7d', '{{Client.Name}}', 'Client', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:10:10.077', '2026-11-25 09:10:10.077'),
('b60a63fe-8658-4d7b-997a-287a9064cf95', 'be52925f-f870-4293-bad1-7e3aa928d9b8', '{{Client.Name}}', 'Client', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:14:36.880', '2026-11-25 09:14:36.880'),
('b61bc4a5-dbd4-4f5e-b51f-573fc719b720', 'fb67f315-9816-4b39-a52a-f04d70347eb8', '{{Client.Name}}', 'Client', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:42:30.175', '2026-11-25 09:42:30.175'),
('b6971171-c872-462d-8f28-c451ee057c9b', 'a967c641-7597-468e-bfa1-bccc3668a316', '{{Matter.MatterNumber}}', 'Matter', 'matterNumber', 1, NULL, 'NONE', NULL, '2026-11-25 09:23:57.599', '2026-11-25 09:23:57.599'),
('b6a55628-fd88-450d-83c9-3894e113b5c6', '3e0af65d-626c-4468-8b9b-6b10b044165b', '{{Attorney.Name}}', 'ResponsibleAttorney', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:16:39.847', '2026-11-25 09:16:39.847'),
('b6d1a7f0-4c92-422d-be51-d4d198138f57', '956862a8-e05a-49d7-a431-f8d353503fb7', '{{Attorney.Name}}', 'ResponsibleAttorney', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:26:29.801', '2026-11-25 09:26:29.801'),
('b73004d6-3747-4c23-93b1-05f580034450', '6e95af9d-a68a-4956-9c62-18e934c98f1d', '{{Matter.MatterNumber}}', 'Matter', 'matterNumber', 1, NULL, 'NONE', NULL, '2026-11-25 09:39:08.714', '2026-11-25 09:39:08.714'),
('b79f2071-b2e8-481a-995b-1c3f40a4bdb5', '33c3b86e-3b0c-4b3a-a5f3-15a26b0395d5', '{{Attorney.Name}}', 'ResponsibleAttorney', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:13:55.497', '2026-11-25 09:13:55.497'),
('b7d07f45-ae64-47e4-ab6d-5f1753329509', '3d18b45d-4569-4168-be21-a212ad7882bf', '{{Matter.MatterNumber}}', 'Matter', 'matterNumber', 1, NULL, 'NONE', NULL, '2026-11-25 09:36:27.490', '2026-11-25 09:36:27.490'),
('b818b0f8-c4c5-4e5f-be5c-2434e8f3c11a', 'f9b4e048-4705-4414-a181-411253453bf6', '{{Client.Name}}', 'Client', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:23:20.542', '2026-11-25 09:23:20.542'),
('b81f0cd9-5726-4f81-94e6-8776cb554737', 'd37ef01a-3309-47ed-99fd-c75e91b05574', '{{Matter.MatterNumber}}', 'Matter', 'matterNumber', 1, NULL, 'NONE', NULL, '2026-11-25 09:20:26.060', '2026-11-25 09:20:26.060'),
('b830c07f-e2fc-4955-87b5-dda48f9e26be', '76395bd0-02c0-43be-8bbc-63a75e09d00d', '{{Matter.MatterNumber}}', 'Matter', 'matterNumber', 1, NULL, 'NONE', NULL, '2026-11-25 09:12:48.006', '2026-11-25 09:12:48.006'),
('b84a7cdb-5e48-4da1-9773-da619f42a2ab', 'a0952cf1-1670-4189-8513-382751260037', '{{Attorney.Name}}', 'ResponsibleAttorney', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:43:07.970', '2026-11-25 09:43:07.970'),
('b84b24b9-89bb-4c7b-904c-5e0e76e46cda', '25cda274-07df-4c65-88da-f1ff8e45e0dd', '{{Attorney.Name}}', 'ResponsibleAttorney', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:22:36.613', '2026-11-25 09:22:36.613'),
('b8775d2b-05d9-4532-93e8-ae8f970e7c6d', 'd554bfda-8bce-4121-a8fa-a94f5da56ba5', 'Insurance.ClaimNumber', 'Insurance', 'claimNumber', 1, NULL, 'NONE', NULL, '2026-11-14 09:29:36.759', '2026-11-14 09:29:36.759'),
('b88be064-a282-4e43-a4f1-429d8dc526ab', 'e69186ac-46bc-4fea-82bf-e9bd834342ac', '{{Attorney.Name}}', 'ResponsibleAttorney', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:15:11.521', '2026-11-25 09:15:11.521'),
('b8987512-2bb1-446d-8518-fd8905f686ae', '5e4e18a0-301e-4bb3-865b-43e3f87e3ac7', '{{Attorney.Name}}', 'ResponsibleAttorney', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:09:59.969', '2026-11-25 09:09:59.969'),
('b8cea803-1731-4eec-87ae-bf6f1c17828e', 'fe7b7db2-ab5b-4c22-bbd9-6c48fb296c01', '{{Attorney.Name}}', 'ResponsibleAttorney', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:25:15.933', '2026-11-25 09:25:15.933'),
('b8ea6765-03e9-4da1-9180-e89eed1e0cb8', 'fe7b7db2-ab5b-4c22-bbd9-6c48fb296c01', '{{Matter.MatterNumber}}', 'Matter', 'matterNumber', 1, NULL, 'NONE', NULL, '2026-11-25 09:25:15.933', '2026-11-25 09:25:15.933'),
('b8f59f84-6f88-4542-a18f-086314d21076', '33c3b86e-3b0c-4b3a-a5f3-15a26b0395d5', '{{Client.Name}}', 'Client', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:13:55.497', '2026-11-25 09:13:55.497'),
('b932b82d-13d5-4780-bdf6-0ad0fc92df7e', '5bfb7b62-bdf1-4121-be46-0f8efa189962', '{{Matter.Title}}', 'Matter', 'title', 1, NULL, 'NONE', NULL, '2026-11-25 09:40:22.102', '2026-11-25 09:40:22.102'),
('b979d5df-ae10-455d-b807-baa00c88b336', 'aaadd169-b1e0-4879-acd9-7d4901b33831', '{{Matter.MatterNumber}}', 'Matter', 'matterNumber', 1, NULL, 'NONE', NULL, '2026-11-25 09:23:06.532', '2026-11-25 09:23:06.532'),
('b98bbeec-21c5-4406-a87e-a2bcf5a2646d', '5d439c99-f896-4a7f-99e9-3f7c2bf237a9', '{{Attorney.Name}}', 'ResponsibleAttorney', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:20:48.401', '2026-11-25 09:20:48.401'),
('b9b4a97a-057e-4738-a222-b629b4338cbe', '32f25e0b-12dd-48ac-ac0d-c0a67fdaf285', '{{Attorney.Name}}', 'ResponsibleAttorney', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:36:20.721', '2026-11-25 09:36:20.721'),
('b9e18822-83d8-4c15-8a46-01bf6ddef52a', 'd534334f-ffd5-4c0f-891f-4361aeabdccb', '{{Client.Name}}', 'Client', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:14:29.395', '2026-11-25 09:14:29.395'),
('ba2492c9-2e3c-4b8a-8791-159160b4ae42', '7f58167b-7eb3-464f-8b2e-1555bb0b09f6', '{{Attorney.Name}}', 'ResponsibleAttorney', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:28:06.109', '2026-11-25 09:28:06.109'),
('baa36c9b-03e1-4b59-8bd1-f099fa4a4f20', '34590700-cfd8-4fe4-bbd5-8519dee10003', '{{Matter.MatterNumber}}', 'Matter', 'matterNumber', 1, NULL, 'NONE', NULL, '2026-11-25 09:37:15.408', '2026-11-25 09:37:15.408'),
('baba558a-2aca-4ed5-9c01-bde3e9fba48e', 'd37ef01a-3309-47ed-99fd-c75e91b05574', '{{Client.Name}}', 'Client', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:20:26.060', '2026-11-25 09:20:26.060'),
('bae7d454-8c8f-46d5-b844-062e4ff0445f', '89f74c3f-b3dc-479d-808f-a199f5f4480c', '{{Attorney.Name}}', 'ResponsibleAttorney', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:38:34.336', '2026-11-25 09:38:34.336'),
('baf522f6-d933-474a-9fe0-65243ee82311', 'b462c8c5-68e7-491e-886c-59ea27158991', '{{Matter.MatterNumber}}', 'Matter', 'matterNumber', 1, NULL, 'NONE', NULL, '2026-11-25 09:26:05.542', '2026-11-25 09:26:05.542'),
('bb5ce725-45b5-4316-b16d-419a8fb02caa', '40b1c509-16ea-4fb3-b050-c2dc12af9afa', '{{Client.Name}}', 'Client', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:35:59.775', '2026-11-25 09:35:59.775'),
('bb9fae9c-85cc-4eb9-a176-7a752fdbbaf0', '76395bd0-02c0-43be-8bbc-63a75e09d00d', '{{Matter.Title}}', 'Matter', 'title', 1, NULL, 'NONE', NULL, '2026-11-25 09:12:48.006', '2026-11-25 09:12:48.006'),
('bbc44d61-cb93-4c32-a53d-222262d87151', '84b6150f-c07b-449b-bc21-dc242056935f', '{{Client.Name}}', 'Client', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:30:44.324', '2026-11-25 09:30:44.324'),
('bbc63be4-62d4-4515-85a5-db6169eba52e', '0ad99ee2-841e-468d-98b1-a51f2e5b51ee', '{{Client.Name}}', 'Client', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:21:13.110', '2026-11-25 09:21:13.110'),
('bc117750-a19a-4bd5-ae55-21131aa513f8', 'c8e2f1fe-5365-44b5-a497-437d71a02c2d', '{{Matter.Title}}', 'Matter', 'title', 1, NULL, 'NONE', NULL, '2026-11-25 09:26:22.331', '2026-11-25 09:26:22.331'),
('bc38d0dc-02f2-401f-81c7-ea57fa7db2b8', '95774654-8970-47c7-98f5-5b016d390ff1', '{{Attorney.Name}}', 'ResponsibleAttorney', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:44:07.839', '2026-11-25 09:44:07.839'),
('bc834166-9327-4857-a8ec-992417cf3e11', 'bfca17de-bbd6-4c08-92f0-3f99bfb54785', '{{Matter.Title}}', 'Matter', 'title', 1, NULL, 'NONE', NULL, '2026-11-25 09:39:47.060', '2026-11-25 09:39:47.060'),
('bc8487bf-917a-465e-b92e-8316e1f01f0f', 'ec1c0e31-fed1-4081-9ec7-c1588deef41e', '{{Matter.Title}}', 'Matter', 'title', 1, NULL, 'NONE', NULL, '2026-11-25 09:35:52.189', '2026-11-25 09:35:52.189');
INSERT INTO `document_field_mappings` (`id`, `template_version_id`, `placeholder_tag`, `source_entity`, `source_field`, `is_required`, `default_value`, `formatting_rule`, `conditional_expression`, `created_at`, `updated_at`) VALUES
('bcc7518a-f6dd-4d18-9b0f-90dd16757d3c', 'e156defb-48fa-424a-9036-9fbb2c624c41', '{{Matter.Title}}', 'Matter', 'title', 1, NULL, 'NONE', NULL, '2026-11-25 09:23:43.289', '2026-11-25 09:23:43.289'),
('bcd66da5-3bd1-4f8f-8141-721b3f30b389', 'd51ef237-53a6-4724-a58f-1620a49a6b25', '{{Insurance.ClaimNumber}}', 'Insurance', 'claimNumber', 0, NULL, 'NONE', NULL, '2026-11-25 09:20:40.792', '2026-11-25 09:20:40.792'),
('bd4931e8-1836-4440-a045-ddb5da262724', '4a08e886-9403-4d5f-8cf6-8666d9bad508', '{{Attorney.Name}}', 'ResponsibleAttorney', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:39:55.755', '2026-11-25 09:39:55.755'),
('bd62b56d-317f-4d5f-8420-07c80208a41a', 'e6cf600c-080d-42b6-a561-f64fb49f23ac', 'Attorney.Name', 'Attorney', 'name', 1, NULL, 'NONE', NULL, '2026-11-14 09:29:54.406', '2026-11-14 09:29:54.406'),
('bd9821d1-a0db-4a62-8aa2-45a002d367cc', 'f512924e-1ce1-4f7c-8a32-1b102bed96b8', '{{Client.Name}}', 'Client', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:21:39.574', '2026-11-25 09:21:39.574'),
('bdc8b1a7-573b-4c95-845b-efc3c076dcba', '3dcceccc-1e07-4dd6-8f21-e7a09f064265', '{{Matter.Title}}', 'Matter', 'title', 1, NULL, 'NONE', NULL, '2026-11-25 09:12:01.509', '2026-11-25 09:12:01.509'),
('be3f213f-04a9-42db-9023-e25e094a9809', '27f17c2f-55ae-406c-8d5d-1cde5931934d', '{{Client.Name}}', 'Client', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:31:06.958', '2026-11-25 09:31:06.958'),
('be4f0bf1-28cd-4727-b07b-9ba09fcd9115', '0527cd62-fdb7-4653-b0db-0199b267563c', '{{Matter.MatterNumber}}', 'Matter', 'matterNumber', 1, NULL, 'NONE', NULL, '2026-11-25 09:22:44.662', '2026-11-25 09:22:44.662'),
('be66ac83-e53d-4f32-8fd2-43d557786c72', '7589c3cd-fd6c-4337-9606-20bc893e01e2', '{{Matter.Title}}', 'Matter', 'title', 1, NULL, 'NONE', NULL, '2026-11-25 09:32:44.786', '2026-11-25 09:32:44.786'),
('be6824a7-3362-40a3-8ccf-6117b15e7cb6', 'ab7e814b-ed5e-4402-8e4e-3c7f1fbae3e7', '{{Matter.MatterNumber}}', 'Matter', 'matterNumber', 1, NULL, 'NONE', NULL, '2026-11-25 09:41:44.613', '2026-11-25 09:41:44.613'),
('bed21460-6418-4891-ae42-925585ddd9de', '0dd95a0a-5203-4716-ae35-89a0595c46d6', '{{Client.Name}}', 'Client', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:19:34.708', '2026-11-25 09:19:34.708'),
('bf097f15-3564-4684-b3c2-36e0a897fca1', '38dfc741-2eb3-490f-aee9-85ee6a82c9f5', '{{Client.Name}}', 'Client', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:35:22.673', '2026-11-25 09:35:22.673'),
('bf264ad6-ef95-4047-8710-7496764a35f3', '337aeffc-4ece-4ce7-82a5-d6b928eefac4', '{{Attorney.Name}}', 'ResponsibleAttorney', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:09:02.748', '2026-11-25 09:09:02.748'),
('bf5d42bb-42e7-438f-9915-fb387fa4be8a', 'cda60690-b708-484d-b818-da492d1ec9f4', '{{Matter.MatterNumber}}', 'Matter', 'matterNumber', 1, NULL, 'NONE', NULL, '2026-11-25 09:20:00.458', '2026-11-25 09:20:00.458'),
('bf7a0a76-d3f0-4061-a314-2e77c9014b99', '4f9a81a9-9252-4774-9e0a-dd01e6c80ac9', '{{Attorney.Name}}', 'ResponsibleAttorney', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:11:54.187', '2026-11-25 09:11:54.187'),
('bf860f56-4bc1-41ba-9ff6-eca8284099e9', '7589c3cd-fd6c-4337-9606-20bc893e01e2', '{{Client.Name}}', 'Client', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:32:44.786', '2026-11-25 09:32:44.786'),
('c02359f8-0cc3-4d81-95ce-7b30eddd8dfc', '9f876323-e455-4913-9232-d561ae223b81', '{{Matter.MatterNumber}}', 'Matter', 'matterNumber', 1, NULL, 'NONE', NULL, '2026-11-25 09:36:49.099', '2026-11-25 09:36:49.099'),
('c0399b26-0add-4574-ba01-54c20077e965', '6e739347-97f7-4a33-b95c-78043f9aed05', '{{Client.Name}}', 'Client', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:19:52.633', '2026-11-25 09:19:52.633'),
('c07f5b4e-34fb-4a0b-91ba-4ba069b78cdf', 'd26b2d0a-875b-440e-bdd0-98d209b395f6', '{{Client.Name}}', 'Client', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:21:57.086', '2026-11-25 09:21:57.086'),
('c0b4d302-11e2-433f-a7b6-b13eeef4578a', '5361481e-129a-40d6-9934-520daeffbe6a', '{{Matter.MatterNumber}}', 'Matter', 'matterNumber', 1, NULL, 'NONE', NULL, '2026-11-25 09:32:09.257', '2026-11-25 09:32:09.257'),
('c0cb6d37-57e4-477b-8e57-70896e9ece1d', '89f74c3f-b3dc-479d-808f-a199f5f4480c', '{{Matter.MatterNumber}}', 'Matter', 'matterNumber', 1, NULL, 'NONE', NULL, '2026-11-25 09:38:34.336', '2026-11-25 09:38:34.336'),
('c0d69f7a-5651-4c4b-844c-290cc0afc3b3', '60d52c8c-966e-4e95-b691-cbc80e8d385f', '{{Matter.MatterNumber}}', 'Matter', 'matterNumber', 1, NULL, 'NONE', NULL, '2026-11-25 09:39:41.551', '2026-11-25 09:39:41.551'),
('c0f81679-5fa8-4932-b5ae-fc66b00de5c4', '5da49101-918d-4970-8839-06070643f366', '{{Attorney.Name}}', 'ResponsibleAttorney', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:24:30.718', '2026-11-25 09:24:30.718'),
('c16af480-945d-4977-8209-1ecb51e5f290', '8550fd39-39c9-46e4-ac0d-b95d3ed4d125', '{{Client.Name}}', 'Client', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:36:56.022', '2026-11-25 09:36:56.022'),
('c16dbc81-173e-4a9b-9f9d-138708e3a5ee', '4bbb16ac-a0c8-4ead-87b5-1d3fd4c9997c', '{{Client.Name}}', 'Client', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:41:23.875', '2026-11-25 09:41:23.875'),
('c1cf1a53-4653-4776-9f23-522a59ce4d18', '58ec5cad-437f-4a3c-8985-2768faed1166', '{{Matter.MatterNumber}}', 'Matter', 'matterNumber', 1, NULL, 'NONE', NULL, '2026-11-25 09:34:59.842', '2026-11-25 09:34:59.842'),
('c1d20e4c-0ef1-40df-af22-8eed4983ffcd', '65587343-3be5-4fb8-949e-9ec79b5633e9', '{{Client.Name}}', 'Client', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:30:59.762', '2026-11-25 09:30:59.762'),
('c1da030a-92ce-4331-bdfe-9e5c8a0286ce', '3a87d8d8-132a-4617-8d8d-eab7b162be4a', '{{Matter.Title}}', 'Matter', 'title', 1, NULL, 'NONE', NULL, '2026-11-25 09:29:16.116', '2026-11-25 09:29:16.116'),
('c21a26d3-40b3-4a19-a345-cb36cc47e0e6', '899c0e12-1011-483a-885a-3dd965fc3a50', '{{Matter.Title}}', 'Matter', 'title', 1, NULL, 'NONE', NULL, '2026-11-25 09:44:34.395', '2026-11-25 09:44:34.395'),
('c22eb3b7-de70-46b7-b1c4-355b8ee796ef', 'b0f8af6b-e459-46d0-849b-c7d88fc13633', '{{Attorney.Name}}', 'ResponsibleAttorney', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:24:45.504', '2026-11-25 09:24:45.504'),
('c2578467-cffd-4446-90db-e52c42bf8428', 'b34abf61-fe95-49b8-810d-c4aca66effd6', '{{Matter.MatterNumber}}', 'Matter', 'matterNumber', 1, NULL, 'NONE', NULL, '2026-11-25 09:34:49.041', '2026-11-25 09:34:49.041'),
('c2a75046-c4c1-4c7f-8bba-d9ae96659dd7', '58cfe8c5-ef3d-4a4a-b367-577985a01b75', 'MedicalProvider.Address', 'MedicalProvider', 'address', 1, NULL, 'NONE', NULL, '2026-11-14 09:29:43.932', '2026-11-14 09:29:43.932'),
('c2ab5c24-3d76-40b3-ac69-dfd7477837b8', '7c968a6f-a8ff-49dd-a563-671184d476f0', '{{Matter.Title}}', 'Matter', 'title', 1, NULL, 'NONE', NULL, '2026-11-25 09:10:37.449', '2026-11-25 09:10:37.449'),
('c2ad2ea3-ce5f-432f-8d07-cbe6dfef4b00', '80fef0d7-db33-4f64-9345-7e456af3165b', '{{Matter.Title}}', 'Matter', 'title', 1, NULL, 'NONE', NULL, '2026-11-25 09:21:23.822', '2026-11-25 09:21:23.822'),
('c2ae9ecb-d629-4972-879e-e277d2973ac0', 'e6cf600c-080d-42b6-a561-f64fb49f23ac', 'Client.Name', 'Client', 'name', 1, NULL, 'NONE', NULL, '2026-11-14 09:29:54.406', '2026-11-14 09:29:54.406'),
('c2d2cc70-ee2f-4084-b1b8-9a20042311c8', 'c74c8d8a-da5f-45a1-b4d9-37382fa0edc7', '{{Client.Name}}', 'Client', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:07:28.820', '2026-11-25 09:07:28.820'),
('c2ed8e84-1af6-422b-9399-46966c487955', 'ad50cecb-c9da-4316-8604-9bb9c54fe810', '{{Matter.Title}}', 'Matter', 'title', 1, NULL, 'NONE', NULL, '2026-11-25 09:32:36.184', '2026-11-25 09:32:36.184'),
('c2f01f55-ff6a-47a3-a2b7-8ec5370f1793', '63f83669-73d7-4103-8985-2988d5f0bd36', '{{Matter.Title}}', 'Matter', 'title', 1, NULL, 'NONE', NULL, '2026-11-25 09:28:47.493', '2026-11-25 09:28:47.493'),
('c339a08f-55bb-4481-baef-dd9ad84a5464', '34590700-cfd8-4fe4-bbd5-8519dee10003', '{{Attorney.Name}}', 'ResponsibleAttorney', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:37:15.408', '2026-11-25 09:37:15.408'),
('c33fc530-8fe3-4d5e-b898-e6bf03d7ada8', '94dfbc9b-cc38-442f-801b-f9c7ffc02668', '{{Matter.MatterNumber}}', 'Matter', 'matterNumber', 1, NULL, 'NONE', NULL, '2026-11-25 09:17:48.644', '2026-11-25 09:17:48.644'),
('c3522407-f7e0-4dba-af93-d2fa7c9b7dd3', 'ace0b629-cae7-4260-93af-3643d8d3dd58', '{{CurrentDate.Long}}', 'CurrentDate', 'long', 0, NULL, 'NONE', NULL, '2026-11-25 09:23:14.204', '2026-11-25 09:23:14.204'),
('c390ac14-7f17-4205-93ba-ea8d15c4e5e8', '64dd38ea-8636-4110-ada9-9363f9452197', '{{Matter.MatterNumber}}', 'Matter', 'matterNumber', 1, NULL, 'NONE', NULL, '2026-11-25 09:28:29.468', '2026-11-25 09:28:29.468'),
('c3af066f-22bb-4e67-ba1d-ad5879e285d7', 'ab7e814b-ed5e-4402-8e4e-3c7f1fbae3e7', '{{Attorney.Name}}', 'ResponsibleAttorney', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:41:44.613', '2026-11-25 09:41:44.613'),
('c3b54bfc-795d-4a74-9ffc-e03a4047bc2b', 'e6cf600c-080d-42b6-a561-f64fb49f23ac', 'MedicalProvider.Name', 'MedicalProvider', 'name', 1, NULL, 'NONE', NULL, '2026-11-14 09:29:54.406', '2026-11-14 09:29:54.406'),
('c3e255df-fe6e-4bf7-9ebb-67b8500a14c0', '4dd43b62-0d3b-44e7-81cb-7adce004b7a6', '{{Attorney.Name}}', 'ResponsibleAttorney', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:34:41.992', '2026-11-25 09:34:41.992'),
('c3f5b17a-d3ee-4abd-bef3-aca3962246e1', '5a981617-df0e-4bdb-82f9-9d15d3011053', '{{Matter.MatterNumber}}', 'Matter', 'matterNumber', 1, NULL, 'NONE', NULL, '2026-11-25 09:42:08.360', '2026-11-25 09:42:08.360'),
('c40a10ac-a8ba-486c-b866-a6cedf7b2e08', '25ed3bd4-4976-43e6-9a0f-75696cae49f6', '{{Matter.MatterNumber}}', 'Matter', 'matterNumber', 1, NULL, 'NONE', NULL, '2026-11-25 09:37:34.236', '2026-11-25 09:37:34.236'),
('c470bda6-1896-435b-aa94-e9c6edcac887', 'd24c9473-cba3-4708-a4ef-3e4fb5ed825c', '{{Matter.Title}}', 'Matter', 'title', 1, NULL, 'NONE', NULL, '2026-11-25 09:38:28.453', '2026-11-25 09:38:28.453'),
('c4e13081-97d8-454e-bb64-2b61a945cc1a', 'ffd84a63-15dd-4736-ac53-3cdf07c061d1', '{{Matter.Title}}', 'Matter', 'title', 1, NULL, 'NONE', NULL, '2026-11-25 09:06:41.631', '2026-11-25 09:06:41.631'),
('c53b918e-1f23-42ce-9651-f2397cb9b837', '3cdd654e-d99e-42e9-a77a-8687e4163a1f', '{{Matter.MatterNumber}}', 'Matter', 'matterNumber', 1, NULL, 'NONE', NULL, '2026-11-25 09:11:47.534', '2026-11-25 09:11:47.534'),
('c55377f6-8d17-4319-a037-61c3206308bf', '0546be74-b575-4c89-9c7e-4dde025b29d8', '{{Client.Name}}', 'Client', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:37:20.927', '2026-11-25 09:37:20.927'),
('c5ef3189-df2f-4337-9d76-45bc88c9c02a', '512ed74f-1f59-4a55-bbb2-348dc6dc277e', '{{Matter.Title}}', 'Matter', 'title', 1, NULL, 'NONE', NULL, '2026-11-25 09:22:59.548', '2026-11-25 09:22:59.548'),
('c607a78e-04bd-4992-bc50-6d5436cf64bc', '1f4de991-5e27-4cca-97fb-d30b56289a97', '{{Client.Name}}', 'Client', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:17:54.539', '2026-11-25 09:17:54.539'),
('c614bc2e-da70-46c0-ba86-b598be9742a6', '9c67f9f1-d35c-4140-aa89-9d63475911cb', '{{Attorney.Name}}', 'ResponsibleAttorney', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:37:47.374', '2026-11-25 09:37:47.374'),
('c62dc155-a5c9-4801-967c-bb586a481f0d', 'bd5f9e2c-a31a-47ab-98fa-b2098f51e5dd', '{{Attorney.Name}}', 'ResponsibleAttorney', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:35:14.725', '2026-11-25 09:35:14.725'),
('c65e4cb9-85ff-4f1b-acb8-bce7d1903dd5', '131e2bc8-78b6-49ec-b3e2-835f46fa23ce', '{{Attorney.Name}}', 'ResponsibleAttorney', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:33:24.062', '2026-11-25 09:33:24.062'),
('c6b9108f-1a73-49fe-9e6e-031e15feb5ab', 'b726e008-8057-43b2-88b6-e77d1b970af8', '{{Matter.Title}}', 'Matter', 'title', 1, NULL, 'NONE', NULL, '2026-11-25 09:15:54.643', '2026-11-25 09:15:54.643'),
('c6dcda5c-081e-4ae8-8309-a116ba463bbb', 'eb02f6e2-eb95-476b-9f3a-0012c5e69de4', '{{Client.Name}}', 'Client', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:37:55.738', '2026-11-25 09:37:55.738'),
('c71747db-f2b1-4185-9f09-9122b95c0c01', 'a8148ce8-8831-4767-aa6a-677772967a2a', '{{Attorney.Name}}', 'ResponsibleAttorney', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:44:28.526', '2026-11-25 09:44:28.526'),
('c721ef55-39f0-4999-a6b3-defa5a459a7e', '3a87d8d8-132a-4617-8d8d-eab7b162be4a', '{{Matter.MatterNumber}}', 'Matter', 'matterNumber', 1, NULL, 'NONE', NULL, '2026-11-25 09:29:16.116', '2026-11-25 09:29:16.116'),
('c74596ad-af3f-4d70-9814-16a42cd15f8a', 'd534334f-ffd5-4c0f-891f-4361aeabdccb', '{{Matter.Title}}', 'Matter', 'title', 1, NULL, 'NONE', NULL, '2026-11-25 09:14:29.395', '2026-11-25 09:14:29.395'),
('c772313e-9377-42f0-b392-33dea6e9cd9f', 'd51ef237-53a6-4724-a58f-1620a49a6b25', '{{Attorney.Name}}', 'ResponsibleAttorney', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:20:40.792', '2026-11-25 09:20:40.792'),
('c789ae82-20a2-4c4d-8585-f86a6fa95814', '6c598600-36e9-4b4d-a4b8-af354c65699e', '{{Client.Name}}', 'Client', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:34:16.928', '2026-11-25 09:34:16.928'),
('c8239ec5-e861-40ac-a857-f4e08e82c902', '17b2f3bb-0fbb-4884-a827-24f65dc7b81e', '{{CurrentDate.Long}}', 'CurrentDate', 'long', 0, NULL, 'NONE', NULL, '2026-11-25 09:15:27.042', '2026-11-25 09:15:27.042'),
('c8319adc-b8c4-44e7-a01e-f088ebe1085f', '3a8c0d1e-c077-4ffd-a5f3-9771fd6187ab', '{{Matter.MatterNumber}}', 'Matter', 'matterNumber', 1, NULL, 'NONE', NULL, '2026-11-25 09:28:12.409', '2026-11-25 09:28:12.409'),
('c86cb62c-0385-47b1-9026-1ddf8833d2fc', 'b462c8c5-68e7-491e-886c-59ea27158991', '{{Attorney.Name}}', 'ResponsibleAttorney', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:26:05.542', '2026-11-25 09:26:05.542'),
('c883be1b-cd1d-4e0e-8b6e-6fd7c46755b3', '863ecb6b-acb2-468e-8280-6869008e38c4', '{{Matter.MatterNumber}}', 'Matter', 'matterNumber', 1, NULL, 'NONE', NULL, '2026-11-25 09:25:40.453', '2026-11-25 09:25:40.453'),
('c8b345e1-db11-4f67-9e23-d0b5da369c15', 'c1df0c28-85dc-454d-a4b5-8cfa6b73fdae', '{{Client.Name}}', 'Client', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:39:35.618', '2026-11-25 09:39:35.618'),
('c8f53e19-cbf0-419f-8f58-269399a14dc7', '47eba881-7be9-448c-a110-8e078bcd7706', '{{Matter.MatterNumber}}', 'Matter', 'matterNumber', 1, NULL, 'NONE', NULL, '2026-11-25 09:31:33.372', '2026-11-25 09:31:33.372'),
('c91ef282-597c-4d16-968e-0702cde01d79', '50a5e530-ac91-4503-a883-e3f98ebcb26a', '{{CurrentDate.Long}}', 'CurrentDate', 'long', 0, NULL, 'NONE', NULL, '2026-11-25 09:16:46.597', '2026-11-25 09:16:46.597'),
('c91f6f6e-539e-4ae6-913e-83bda6cd6211', '624c4276-dd94-475c-b02b-8aadc8109363', '{{Matter.MatterNumber}}', 'Matter', 'matterNumber', 1, NULL, 'NONE', NULL, '2026-11-25 09:27:54.188', '2026-11-25 09:27:54.188'),
('c92eae5e-aca2-4686-b916-8587322493e8', 'd220f2ef-879d-4a4c-baa4-9701c3f16d60', '{{Insurance.AdjusterName}}', 'Insurance', 'adjusterName', 0, NULL, 'NONE', NULL, '2026-11-25 09:20:32.818', '2026-11-25 09:20:32.818'),
('c9327822-c964-49c5-a7ec-d0df19957951', '29d5db33-4c61-43b3-b55c-5ca8253f38e0', '{{Matter.Title}}', 'Matter', 'title', 1, NULL, 'NONE', NULL, '2026-11-25 09:18:20.075', '2026-11-25 09:18:20.075'),
('c9a3c072-576e-4b36-a4f0-4f4de5d61d40', '27f73e77-5dbf-4beb-947f-2cac6003fbd8', '{{Attorney.Name}}', 'ResponsibleAttorney', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:12:56.213', '2026-11-25 09:12:56.213'),
('c9ca40f3-e8d6-4018-bf2b-8e094cd65755', 'b0f8af6b-e459-46d0-849b-c7d88fc13633', '{{Matter.MatterNumber}}', 'Matter', 'matterNumber', 1, NULL, 'NONE', NULL, '2026-11-25 09:24:45.504', '2026-11-25 09:24:45.504'),
('c9d560e0-a981-4d36-94a7-9699dedb84f9', '0a100241-1565-4041-8f2b-b25c3d3292a6', '{{Attorney.Name}}', 'ResponsibleAttorney', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:11:37.540', '2026-11-25 09:11:37.540'),
('c9dcc71e-bbac-4e5d-b43c-692d9787e0f2', '613a6b40-e687-4fef-b6fb-073e8e3bf25a', '{{Matter.MatterNumber}}', 'Matter', 'matterNumber', 1, NULL, 'NONE', NULL, '2026-11-25 09:38:08.829', '2026-11-25 09:38:08.829'),
('ca51f469-b205-40d8-b4a3-194523ad5d84', 'f55f9f4b-1665-4b30-acba-b249d2a03da2', '{{Attorney.Name}}', 'ResponsibleAttorney', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:44:42.548', '2026-11-25 09:44:42.548'),
('ca559841-cc9e-43ce-a3e2-719502c15025', '6f4e7b2b-9b59-419e-9e16-9a91ef17a6ad', '{{Client.Name}}', 'Client', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:35:44.995', '2026-11-25 09:35:44.995'),
('ca586599-df6b-44f7-804b-819295ed7cf1', '19b4ea63-d6fe-4c78-a4aa-4e15274d8020', '{{Matter.MatterNumber}}', 'Matter', 'matterNumber', 1, NULL, 'NONE', NULL, '2026-11-25 09:39:14.262', '2026-11-25 09:39:14.262'),
('ca5a341e-a9ed-49d1-8a04-848699da5843', '57a5bfb2-dd4c-4b48-84be-e2d51eb69b99', '{{Client.Name}}', 'Client', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:22:53.102', '2026-11-25 09:22:53.102'),
('ca95bd4a-2d2d-4109-9e01-a9abf6fc565d', '96e98b6c-5022-4a6a-8538-45dea007ec14', '{{Matter.MatterNumber}}', 'Matter', 'matterNumber', 1, NULL, 'NONE', NULL, '2026-11-25 09:30:03.286', '2026-11-25 09:30:03.286'),
('cacca927-bb9d-4472-a44a-a49aaf552219', '6cd5cc86-0fd6-4dbe-b6a2-9ec56b0b5d54', '{{Matter.Title}}', 'Matter', 'title', 1, NULL, 'NONE', NULL, '2026-11-25 09:12:09.936', '2026-11-25 09:12:09.936'),
('caeb4008-e5db-499d-87c4-e72b2752dc9a', '5d439c99-f896-4a7f-99e9-3f7c2bf237a9', '{{Incident.AccidentDate}}', 'Incident', 'accidentDate', 0, NULL, 'DATE_LONG', NULL, '2026-11-25 09:20:48.401', '2026-11-25 09:20:48.401'),
('cb272331-0ea7-4369-bb32-52bd0a3e9228', '02f61270-49a4-46bb-87ec-b6a95478b939', '{{Matter.Title}}', 'Matter', 'title', 1, NULL, 'NONE', NULL, '2026-11-25 09:08:19.002', '2026-11-25 09:08:19.002'),
('cb335442-16f1-4dac-a43e-defee4847ffd', '3dcceccc-1e07-4dd6-8f21-e7a09f064265', '{{Attorney.Name}}', 'ResponsibleAttorney', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:12:01.509', '2026-11-25 09:12:01.509'),
('cb757092-05a0-42c6-8ca5-9eb4f51adee3', 'c817370e-6a7c-4971-9a06-d1d243a3249e', '{{Matter.MatterNumber}}', 'Matter', 'matterNumber', 1, NULL, 'NONE', NULL, '2026-11-25 09:17:41.650', '2026-11-25 09:17:41.650'),
('cbaad89e-f84b-4ba6-be01-4f5093823b53', 'e69186ac-46bc-4fea-82bf-e9bd834342ac', '{{CurrentDate.Long}}', 'CurrentDate', 'long', 0, NULL, 'NONE', NULL, '2026-11-25 09:15:11.521', '2026-11-25 09:15:11.521'),
('cbcb9b99-4f5d-4743-a878-5bb76de49d33', '192fa43c-6472-473c-a04b-d0e469bd25c8', '{{Matter.MatterNumber}}', 'Matter', 'matterNumber', 1, NULL, 'NONE', NULL, '2026-11-25 09:38:15.749', '2026-11-25 09:38:15.749'),
('cbce1ed4-ba58-4825-8c78-ab19c92809b0', 'be52925f-f870-4293-bad1-7e3aa928d9b8', '{{Matter.MatterNumber}}', 'Matter', 'matterNumber', 1, NULL, 'NONE', NULL, '2026-11-25 09:14:36.880', '2026-11-25 09:14:36.880'),
('cbf58dad-8704-464e-b001-4f23bb146a7e', 'c13d06b7-cb6f-4b97-9815-76bbe6828bf1', '{{Matter.MatterNumber}}', 'Matter', 'matterNumber', 1, NULL, 'NONE', NULL, '2026-11-25 09:33:09.779', '2026-11-25 09:33:09.779'),
('cc0eccda-d76b-4abb-97a1-a24180f7533b', 'f0166dee-f985-4d9b-b2de-6cfe1f8ad7d3', '{{Matter.MatterNumber}}', 'Matter', 'matterNumber', 1, NULL, 'NONE', NULL, '2026-11-25 09:06:57.490', '2026-11-25 09:06:57.490'),
('cc35a63d-f8e1-40b8-b6d6-76a23fac8c4e', '1ec6c840-2b23-40bf-a2ae-7145c973e095', '{{Matter.MatterNumber}}', 'Matter', 'matterNumber', 1, NULL, 'NONE', NULL, '2026-11-25 09:41:39.010', '2026-11-25 09:41:39.010'),
('cc38a0d0-d6f8-482c-9855-2cf54c42de9f', '9c67f9f1-d35c-4140-aa89-9d63475911cb', '{{Matter.MatterNumber}}', 'Matter', 'matterNumber', 1, NULL, 'NONE', NULL, '2026-11-25 09:37:47.374', '2026-11-25 09:37:47.374'),
('cc7d6923-6a6e-449a-8e3d-59ee50149490', 'd4dbbe74-9882-4019-a375-d6771172c7ce', '{{Insurance.ClaimNumber}}', 'Insurance', 'claimNumber', 0, NULL, 'NONE', NULL, '2026-11-25 09:26:44.761', '2026-11-25 09:26:44.761'),
('cccbb1f2-abbe-43f9-84bc-ac24284028df', '177ddea4-9282-497e-b399-6e5e9cf7c4bc', '{{Client.Name}}', 'Client', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:16:20.040', '2026-11-25 09:16:20.040'),
('cd07bf71-b65e-4c32-bc95-275f81f873ef', 'bec4931d-f5eb-4ac4-97a7-204023385706', '{{Matter.MatterNumber}}', 'Matter', 'matterNumber', 1, NULL, 'NONE', NULL, '2026-11-25 09:20:10.391', '2026-11-25 09:20:10.391'),
('cd29c475-587f-4a28-b0ef-ca049372bf85', '1c7b9b3b-4466-45fa-994b-f2cc4e40070d', '{{Matter.Title}}', 'Matter', 'title', 1, NULL, 'NONE', NULL, '2026-11-25 09:30:11.806', '2026-11-25 09:30:11.806'),
('cd4543c1-fc19-4b94-bf84-eb50e4418528', 'c5ce2bf6-f9cf-464a-b12a-e34c4d9749cc', '{{Client.Name}}', 'Client', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:28:17.723', '2026-11-25 09:28:17.723'),
('cd6823cb-9300-45f9-a167-6c61d2561bc2', '5347a9ab-7278-4647-bdd5-13d174237f64', '{{Attorney.Name}}', 'ResponsibleAttorney', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:34:29.597', '2026-11-25 09:34:29.597'),
('cd6bccd7-bf91-46d5-99d4-31a42ef1cd24', '337aeffc-4ece-4ce7-82a5-d6b928eefac4', '{{Client.Name}}', 'Client', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:09:02.748', '2026-11-25 09:09:02.748'),
('cd8148e3-46a2-48b8-97e6-1c0839791bae', '9b60b515-2a6b-443d-b1b4-b9be39c9cbff', '{{Matter.Title}}', 'Matter', 'title', 1, NULL, 'NONE', NULL, '2026-11-25 09:45:10.533', '2026-11-25 09:45:10.533'),
('ce15369c-ec2b-4b6a-889a-bba4b6e1a1ce', 'e4b91c44-5bb0-4497-85c2-1ea00f432aca', '{{Client.Name}}', 'Client', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:43:42.925', '2026-11-25 09:43:42.925'),
('ce2adc39-bad9-4cc2-9e7c-193b30c2fba5', '1ae6da1a-7516-477c-9e1b-7ffeafd1bcb6', '{{Client.Name}}', 'Client', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:27:47.278', '2026-11-25 09:27:47.278'),
('ce35ccc3-aa2a-4c9e-acf6-7197df5f02f9', '600309b1-9409-492e-8115-f1cadcf4a2d4', '{{Client.Name}}', 'Client', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:25:34.746', '2026-11-25 09:25:34.746'),
('ce92e3be-e451-48c2-aaf0-5f8bbf23ac0f', '55e6d123-74ea-443a-8bee-7a7913b1b687', '{{Client.Name}}', 'Client', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:37:08.500', '2026-11-25 09:37:08.500'),
('cefb8219-7a1a-455d-ac58-7f07eac1408f', '6aff411c-53cc-4f49-bda2-ecaad33a950c', '{{Attorney.Name}}', 'ResponsibleAttorney', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:43:59.878', '2026-11-25 09:43:59.878'),
('cf31911e-8228-41f4-a532-2b69eac83555', '42179f92-f848-41f2-9b02-33744044ae7a', '{{Client.Name}}', 'Client', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:09:18.012', '2026-11-25 09:09:18.012'),
('cfc26135-8986-4161-81fd-e72e749ace9a', 'ab0ef57c-1551-4441-b538-de13cf647a2b', '{{Attorney.Name}}', 'ResponsibleAttorney', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:08:39.470', '2026-11-25 09:08:39.470'),
('cff10700-b919-4e35-9182-965705865e0f', '84b6150f-c07b-449b-bc21-dc242056935f', '{{Matter.MatterNumber}}', 'Matter', 'matterNumber', 1, NULL, 'NONE', NULL, '2026-11-25 09:30:44.324', '2026-11-25 09:30:44.324'),
('cff10c65-2ab8-4b89-93be-886551db9e5f', 'f0f60427-2e97-4056-bd3a-cf9f245eae61', '{{Client.Name}}', 'Client', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:38:53.675', '2026-11-25 09:38:53.675'),
('cff3b193-0f92-4460-82dd-f5e3aea43eba', 'ed751d5b-ec83-4cc5-a512-32cd82650602', '{{Client.Name}}', 'Client', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:41:49.879', '2026-11-25 09:41:49.879'),
('cff96bdc-765a-4850-8f77-0639e29a4631', '673e6316-9e22-4650-8bbc-f87f1a2f7e3a', '{{Matter.MatterNumber}}', 'Matter', 'matterNumber', 1, NULL, 'NONE', NULL, '2026-11-25 09:25:21.556', '2026-11-25 09:25:21.556'),
('d0615dc1-e118-4e87-a004-29198ee4d79a', '3d93dfc7-961e-4026-b271-9ba36c32e208', '{{Client.Name}}', 'Client', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:09:52.800', '2026-11-25 09:09:52.800'),
('d0732053-e30f-41ad-b4cc-3ca669ffb7e1', '9ab91dff-b35e-4c69-95a1-880497ac24d3', '{{Client.Name}}', 'Client', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:21:48.687', '2026-11-25 09:21:48.687'),
('d0d84df4-ea44-4c3b-8936-4f308d2c4fb6', '60d1ffef-c3d2-4057-9737-b1eae70d5f43', '{{Attorney.Name}}', 'ResponsibleAttorney', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:29:31.214', '2026-11-25 09:29:31.214'),
('d0d8d9e1-723f-4ac1-be0d-b725d6a5d7d1', '836e1674-9f3e-4b15-bbdf-71e9f39cf358', '{{Matter.Title}}', 'Matter', 'title', 1, NULL, 'NONE', NULL, '2026-11-25 09:22:21.046', '2026-11-25 09:22:21.046'),
('d18d0981-7367-473b-8edc-8feb932d35db', '02dd54d6-98d0-413c-8b37-8b1dd6a1369d', '{{Matter.Title}}', 'Matter', 'title', 1, NULL, 'NONE', NULL, '2026-11-25 09:44:21.971', '2026-11-25 09:44:21.971'),
('d1b8e663-89fc-42e7-8782-99a3daa3aa78', 'bdca2373-61f4-4959-92a9-51597dde69c2', '{{Matter.Title}}', 'Matter', 'title', 1, NULL, 'NONE', NULL, '2026-11-25 09:24:25.273', '2026-11-25 09:24:25.273'),
('d1bea63d-9f49-40fc-9048-b2e959670761', '85a9dc73-04a9-429c-bea2-9b6c30b6f1b8', '{{Client.Name}}', 'Client', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:16:06.548', '2026-11-25 09:16:06.548'),
('d1c3091c-913e-4b68-95cf-357b20ddb697', '6c598600-36e9-4b4d-a4b8-af354c65699e', '{{Matter.Title}}', 'Matter', 'title', 1, NULL, 'NONE', NULL, '2026-11-25 09:34:16.928', '2026-11-25 09:34:16.928'),
('d216a2ed-615b-45f5-8286-4dacb6ce7161', '7619287d-b2b5-4020-a2f8-af71d2726f35', '{{Attorney.Name}}', 'ResponsibleAttorney', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:45:28.746', '2026-11-25 09:45:28.746'),
('d248505d-f104-4fc8-95ca-7592326bc7e7', '8f2d0739-761d-4c01-ade2-bfdd100e7001', '{{Attorney.Name}}', 'ResponsibleAttorney', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:23:37.028', '2026-11-25 09:23:37.028'),
('d2cfe4fc-c03d-4dd3-ad26-b62cab0bc2db', 'fb08ce84-4c18-4837-b721-a23609d55a88', '{{Attorney.Name}}', 'ResponsibleAttorney', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:07:54.843', '2026-11-25 09:07:54.843'),
('d2eb83d5-504b-44a0-94d4-5f53c7a8515d', 'b34abf61-fe95-49b8-810d-c4aca66effd6', '{{Attorney.Name}}', 'ResponsibleAttorney', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:34:49.041', '2026-11-25 09:34:49.041'),
('d3026811-2724-4cd5-b826-dbee8663abe0', 'ed751d5b-ec83-4cc5-a512-32cd82650602', '{{Matter.MatterNumber}}', 'Matter', 'matterNumber', 1, NULL, 'NONE', NULL, '2026-11-25 09:41:49.879', '2026-11-25 09:41:49.879'),
('d416304d-a3f4-428f-80b5-852fdc17d97c', '1c7b9b3b-4466-45fa-994b-f2cc4e40070d', '{{Matter.MatterNumber}}', 'Matter', 'matterNumber', 1, NULL, 'NONE', NULL, '2026-11-25 09:30:11.806', '2026-11-25 09:30:11.806'),
('d48cde34-3446-4208-9a38-bc2b62c9fcd5', 'aaadd169-b1e0-4879-acd9-7d4901b33831', '{{Client.Name}}', 'Client', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:23:06.532', '2026-11-25 09:23:06.532'),
('d49a482a-c228-4f09-88ab-4c7cbc4e6ed6', '91dfe486-8f7a-471b-a46a-742db2f4e416', '{{Matter.MatterNumber}}', 'Matter', 'matterNumber', 1, NULL, 'NONE', NULL, '2026-11-25 09:08:30.402', '2026-11-25 09:08:30.402'),
('d4ace7da-5cd9-4956-a5eb-8468449de1ab', '4f9a81a9-9252-4774-9e0a-dd01e6c80ac9', '{{Insurance.ClaimNumber}}', 'Insurance', 'claimNumber', 0, NULL, 'NONE', NULL, '2026-11-25 09:11:54.187', '2026-11-25 09:11:54.187'),
('d50a8ee9-4f87-4e1a-9e9c-de2e3b27e6fd', '5ba7f4b1-3bfe-41f2-b66a-9d4d563937e2', '{{Client.Name}}', 'Client', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:29:43.089', '2026-11-25 09:29:43.089'),
('d55e18ca-94ad-4ea1-80ee-4a06ef9f0b88', '6e54ec21-da29-449d-bae3-5e59a42baf6b', '{{Matter.Title}}', 'Matter', 'title', 1, NULL, 'NONE', NULL, '2026-11-25 09:36:41.403', '2026-11-25 09:36:41.403'),
('d5b9d36c-3014-4ccc-92f6-87e68bb5f420', 'a6c30529-d5fe-4ef6-88f7-5646308ae386', '{{Matter.Title}}', 'Matter', 'title', 1, NULL, 'NONE', NULL, '2026-11-25 09:30:28.757', '2026-11-25 09:30:28.757'),
('d5ef5ae7-5358-437b-9377-a852adae7b90', '9b60b515-2a6b-443d-b1b4-b9be39c9cbff', '{{Attorney.Name}}', 'ResponsibleAttorney', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:45:10.533', '2026-11-25 09:45:10.533'),
('d6423fad-b0b9-48e2-a519-7163c17ec2e9', '80fef0d7-db33-4f64-9345-7e456af3165b', '{{Insurance.ClaimNumber}}', 'Insurance', 'claimNumber', 0, NULL, 'NONE', NULL, '2026-11-25 09:21:23.822', '2026-11-25 09:21:23.822'),
('d6626a65-1986-4101-b2a8-42eb9e955bbc', 'd220f2ef-879d-4a4c-baa4-9701c3f16d60', '{{Matter.Title}}', 'Matter', 'title', 1, NULL, 'NONE', NULL, '2026-11-25 09:20:32.818', '2026-11-25 09:20:32.818'),
('d6b55e77-e78e-459a-a610-355efef692d4', '673e6316-9e22-4650-8bbc-f87f1a2f7e3a', '{{Client.Name}}', 'Client', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:25:21.556', '2026-11-25 09:25:21.556'),
('d6eeaf37-c64c-4152-b383-3db30af01301', 'eb02f6e2-eb95-476b-9f3a-0012c5e69de4', '{{Matter.MatterNumber}}', 'Matter', 'matterNumber', 1, NULL, 'NONE', NULL, '2026-11-25 09:37:55.738', '2026-11-25 09:37:55.738'),
('d70aa4ef-9b8c-452f-a5ff-233c549a329b', '14fc15d3-97ad-4511-8d69-9173305d7e50', '{{Attorney.Name}}', 'ResponsibleAttorney', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:35:06.952', '2026-11-25 09:35:06.952'),
('d78bef57-0f54-4c4f-a43e-36ab8cc14091', 'd24c9473-cba3-4708-a4ef-3e4fb5ed825c', '{{Matter.MatterNumber}}', 'Matter', 'matterNumber', 1, NULL, 'NONE', NULL, '2026-11-25 09:38:28.453', '2026-11-25 09:38:28.453'),
('d7ca5feb-116b-492b-9ebd-b4f35a70bafc', '1c97c77a-8d55-4921-b569-90482c80ddac', '{{Matter.Title}}', 'Matter', 'title', 1, NULL, 'NONE', NULL, '2026-11-25 09:27:41.448', '2026-11-25 09:27:41.448'),
('d7cd985d-94b6-4775-be18-67f23b0190b5', 'a8148ce8-8831-4767-aa6a-677772967a2a', '{{Matter.Title}}', 'Matter', 'title', 1, NULL, 'NONE', NULL, '2026-11-25 09:44:28.526', '2026-11-25 09:44:28.526'),
('d891814a-3b90-4171-ad08-03f3408a5911', 'aaadd169-b1e0-4879-acd9-7d4901b33831', '{{Attorney.Name}}', 'ResponsibleAttorney', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:23:06.532', '2026-11-25 09:23:06.532'),
('d8a9389b-6c1a-4855-b981-6f9479510ca7', '5f1bd215-9ae3-4d54-abcb-1e3ee92b3623', '{{Matter.MatterNumber}}', 'Matter', 'matterNumber', 1, NULL, 'NONE', NULL, '2026-11-25 09:39:28.396', '2026-11-25 09:39:28.396'),
('d8e7fd5b-4c88-4a5e-86a2-342e57173010', '229186e0-fd2e-47f1-8232-6cb06d441d40', '{{Attorney.Name}}', 'ResponsibleAttorney', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:26:52.668', '2026-11-25 09:26:52.668'),
('d9251f90-bc01-45e0-bdd3-a8713b97cf23', 'e69186ac-46bc-4fea-82bf-e9bd834342ac', '{{Matter.MatterNumber}}', 'Matter', 'matterNumber', 1, NULL, 'NONE', NULL, '2026-11-25 09:15:11.521', '2026-11-25 09:15:11.521'),
('d972981e-8ede-4819-a56c-345214205668', '4bc4828e-f99f-4897-9448-cd2ad8e39c37', '{{Matter.Title}}', 'Matter', 'title', 1, NULL, 'NONE', NULL, '2026-11-25 09:45:03.790', '2026-11-25 09:45:03.790'),
('d9ab4982-a252-439a-97f9-7a3f4eb3e30e', '1287a3a4-02d3-4c40-85a0-194b36a3e598', '{{Matter.Title}}', 'Matter', 'title', 1, NULL, 'NONE', NULL, '2026-11-25 09:20:55.585', '2026-11-25 09:20:55.585'),
('d9b3dc73-d914-41ff-85ea-4f541c7ccc1a', '1ec6c840-2b23-40bf-a2ae-7145c973e095', '{{Client.Name}}', 'Client', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:41:39.010', '2026-11-25 09:41:39.010'),
('da20f18b-3849-45e6-9a32-f33210ea52d0', 'e157fff3-b830-4744-a7ea-4f78cc3f88ee', '{{Client.Name}}', 'Client', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:17:33.084', '2026-11-25 09:17:33.084'),
('da2feaf1-70eb-441f-ab66-07ce780408a7', '0015843c-7e56-4ddd-8825-b5d85bc450df', '{{Matter.Title}}', 'Matter', 'title', 1, NULL, 'NONE', NULL, '2026-11-25 09:26:37.754', '2026-11-25 09:26:37.754'),
('da33d41e-b85d-4ebe-a8c0-b2d395b11382', '1ae6da1a-7516-477c-9e1b-7ffeafd1bcb6', '{{Matter.Title}}', 'Matter', 'title', 1, NULL, 'NONE', NULL, '2026-11-25 09:27:47.278', '2026-11-25 09:27:47.278'),
('da51eaa0-0fb8-4615-aeef-410491ff9716', '984370bc-02f5-41d0-b559-2f0031e7ecf0', '{{Matter.Title}}', 'Matter', 'title', 1, NULL, 'NONE', NULL, '2026-11-25 09:15:33.591', '2026-11-25 09:15:33.591'),
('da9c86f9-8260-4362-84c7-5bbfc99926d6', '94cd0be6-7b2b-46b8-bf0c-2afb31db795c', '{{Client.Name}}', 'Client', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:17:06.680', '2026-11-25 09:17:06.680'),
('dacaba69-2a65-4be0-83bc-2eb4181fda16', '64dd38ea-8636-4110-ada9-9363f9452197', '{{Client.Name}}', 'Client', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:28:29.468', '2026-11-25 09:28:29.468'),
('db045a32-6b51-47ce-898d-3b428ee858a1', '1a8791a0-7c79-45e1-a55a-0300de688341', '{{Matter.MatterNumber}}', 'Matter', 'matterNumber', 1, NULL, 'NONE', NULL, '2026-11-25 09:25:58.891', '2026-11-25 09:25:58.891'),
('db397a26-a693-4220-aec5-468cb51127f9', '65587343-3be5-4fb8-949e-9ec79b5633e9', '{{Matter.Title}}', 'Matter', 'title', 1, NULL, 'NONE', NULL, '2026-11-25 09:30:59.762', '2026-11-25 09:30:59.762'),
('db5a6450-61de-4005-95ed-9ca976a862c9', 'b2a1dfa2-e833-452c-8130-04e0b55d4a1d', '{{Client.Name}}', 'Client', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:14:52.736', '2026-11-25 09:14:52.736'),
('db737212-ef62-4d27-93ea-e7dcb944196b', '3e064705-e7f1-40a4-95c4-ef2c47f0d106', '{{Attorney.Name}}', 'ResponsibleAttorney', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:27:15.761', '2026-11-25 09:27:15.761'),
('db8ec34b-7149-4cef-806c-bd3cff9317c4', '863ecb6b-acb2-468e-8280-6869008e38c4', '{{Client.Name}}', 'Client', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:25:40.453', '2026-11-25 09:25:40.453'),
('dbfa4725-6374-4e7b-9666-69ae870567d4', '57a5bfb2-dd4c-4b48-84be-e2d51eb69b99', '{{Attorney.Name}}', 'ResponsibleAttorney', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:22:53.102', '2026-11-25 09:22:53.102'),
('dc432189-c477-4649-8285-5d0595c60dc7', '7402b6b9-9787-4ceb-8664-88ca07ac3156', '{{Matter.Title}}', 'Matter', 'title', 1, NULL, 'NONE', NULL, '2026-11-25 09:23:50.365', '2026-11-25 09:23:50.365'),
('dc6af120-8448-4cdd-b0d5-e63a78ea9b27', '80fef0d7-db33-4f64-9345-7e456af3165b', '{{Matter.MatterNumber}}', 'Matter', 'matterNumber', 1, NULL, 'NONE', NULL, '2026-11-25 09:21:23.822', '2026-11-25 09:21:23.822'),
('dc9b7cb6-ec88-40a6-a667-036d3eb64f24', '1502c247-62a3-4463-81ad-ca1409cdd1a9', '{{Matter.MatterNumber}}', 'Matter', 'matterNumber', 1, NULL, 'NONE', NULL, '2026-11-25 09:27:01.396', '2026-11-25 09:27:01.396'),
('dcc7a170-b351-4c1d-9413-2776e7da24ef', 'e6cf600c-080d-42b6-a561-f64fb49f23ac', 'Matter.MatterNumber', 'Matter', 'matterNumber', 1, NULL, 'NONE', NULL, '2026-11-14 09:29:54.406', '2026-11-14 09:29:54.406'),
('dcefd53c-1119-4d6e-9587-4ab7991f04ec', 'f5baa4d4-c567-40bb-a6da-9bc4cd478cb2', '{{Matter.Title}}', 'Matter', 'title', 1, NULL, 'NONE', NULL, '2026-11-25 09:30:20.873', '2026-11-25 09:30:20.873'),
('dd0bcb47-fefc-4fb0-946d-8aa41df4141a', '1a8791a0-7c79-45e1-a55a-0300de688341', '{{Matter.Title}}', 'Matter', 'title', 1, NULL, 'NONE', NULL, '2026-11-25 09:25:58.891', '2026-11-25 09:25:58.891'),
('dd18ce60-e1b9-4bcf-90df-370941eaaf63', '9692a5aa-2e76-4c88-bb31-9f2573946b83', '{{CurrentDate.Long}}', 'CurrentDate', 'long', 0, NULL, 'NONE', NULL, '2026-11-25 09:09:30.940', '2026-11-25 09:09:30.940'),
('dd1f1bc1-74bb-4133-a24c-5ed33792db37', '228a46fa-e493-4eed-8057-2350df11cfba', 'Client.Name', 'Client', 'name', 1, NULL, 'NONE', NULL, '2026-11-14 09:29:49.029', '2026-11-14 09:29:49.029'),
('dd5de788-665c-48d2-aaff-60e44f06149e', '600309b1-9409-492e-8115-f1cadcf4a2d4', '{{Matter.Title}}', 'Matter', 'title', 1, NULL, 'NONE', NULL, '2026-11-25 09:25:34.746', '2026-11-25 09:25:34.746'),
('dd656b20-63ac-43f4-9f8b-2acba3a2d90d', 'd554bfda-8bce-4121-a8fa-a94f5da56ba5', 'Matter.Title', 'Matter', 'title', 1, NULL, 'NONE', NULL, '2026-11-14 09:29:36.759', '2026-11-14 09:29:36.759'),
('dd79d524-fc29-467f-af58-2fb337c762be', '80fef0d7-db33-4f64-9345-7e456af3165b', '{{Attorney.Name}}', 'ResponsibleAttorney', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:21:23.822', '2026-11-25 09:21:23.822'),
('dd8ceeb4-cd20-45da-8987-fec83faa0cc3', 'b3795800-cd6e-4e96-84d4-f31e28eaab0f', '{{Client.Name}}', 'Client', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:27:22.513', '2026-11-25 09:27:22.513'),
('ddde73eb-fa11-4941-a862-03db5c6582d8', '1287a3a4-02d3-4c40-85a0-194b36a3e598', '{{Matter.MatterNumber}}', 'Matter', 'matterNumber', 1, NULL, 'NONE', NULL, '2026-11-25 09:20:55.585', '2026-11-25 09:20:55.585'),
('de013cf3-a2fd-4ae8-b2ee-9d063515751d', 'd4dbbe74-9882-4019-a375-d6771172c7ce', '{{Attorney.Name}}', 'ResponsibleAttorney', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:26:44.761', '2026-11-25 09:26:44.761'),
('de106b75-17d7-4d6e-bfc2-a8e5e3f3ac55', '23677d2e-5004-42ab-9cf0-46261d6258e5', '{{Client.Name}}', 'Client', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:40:34.614', '2026-11-25 09:40:34.614'),
('de47b64c-fbae-45c0-927f-4220ba5d4a27', '7d717061-8a01-4197-a7ba-9aac4c28051c', '{{Matter.MatterNumber}}', 'Matter', 'matterNumber', 1, NULL, 'NONE', NULL, '2026-11-25 09:42:22.666', '2026-11-25 09:42:22.666'),
('dedc6e54-21cb-42e0-b159-d4e52833d128', '87d1c498-8bb5-43b1-b07b-9b85ff412ce8', '{{Matter.Title}}', 'Matter', 'title', 1, NULL, 'NONE', NULL, '2026-11-25 09:33:01.955', '2026-11-25 09:33:01.955'),
('df7c5970-ab09-45e4-bb7b-d58ef4175fb0', '4bc4828e-f99f-4897-9448-cd2ad8e39c37', '{{Matter.MatterNumber}}', 'Matter', 'matterNumber', 1, NULL, 'NONE', NULL, '2026-11-25 09:45:03.790', '2026-11-25 09:45:03.790'),
('dff7bcc9-e0d3-42de-97b7-1bac6dbb4cad', '34c7c015-df07-496e-ae4a-c4d9cf030a99', '{{Client.Name}}', 'Client', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:18:50.518', '2026-11-25 09:18:50.518'),
('e0166175-73e2-4ab3-b230-bc9ff312904d', '0546be74-b575-4c89-9c7e-4dde025b29d8', '{{Attorney.Name}}', 'ResponsibleAttorney', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:37:20.927', '2026-11-25 09:37:20.927'),
('e04511d9-f56f-4dc0-b01f-3240c5ccdea8', '956862a8-e05a-49d7-a431-f8d353503fb7', '{{Client.Name}}', 'Client', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:26:29.801', '2026-11-25 09:26:29.801'),
('e0c7037e-1d83-4e0e-853d-44cec561fd40', '53bc3d46-cfba-4978-aced-36898c7f25bd', '{{Matter.Title}}', 'Matter', 'title', 1, NULL, 'NONE', NULL, '2026-11-25 09:33:30.964', '2026-11-25 09:33:30.964'),
('e0cba31a-d2a5-4469-9595-43954a6e447d', '8fe19204-74cd-40be-ae84-fbe2a03a3803', '{{Matter.MatterNumber}}', 'Matter', 'matterNumber', 1, NULL, 'NONE', NULL, '2026-11-25 09:10:19.043', '2026-11-25 09:10:19.043'),
('e0cc1426-30f4-49c8-8589-219129728d2d', '91dfe486-8f7a-471b-a46a-742db2f4e416', '{{Client.Name}}', 'Client', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:08:30.402', '2026-11-25 09:08:30.402'),
('e0e27415-d060-40bd-8890-b56da956de91', '3e010dc9-fa85-4ad9-8a07-540f5b72d1ea', '{{Matter.MatterNumber}}', 'Matter', 'matterNumber', 1, NULL, 'NONE', NULL, '2026-11-25 09:44:14.592', '2026-11-25 09:44:14.592'),
('e0eb59a7-207d-4439-b825-ac59fb1d7146', 'f5baa4d4-c567-40bb-a6da-9bc4cd478cb2', '{{Matter.MatterNumber}}', 'Matter', 'matterNumber', 1, NULL, 'NONE', NULL, '2026-11-25 09:30:20.873', '2026-11-25 09:30:20.873'),
('e0ee4783-ec29-4829-9663-1d916f375cc0', '08788e72-5146-48ca-98ce-5982d0d2b77f', '{{Matter.Title}}', 'Matter', 'title', 1, NULL, 'NONE', NULL, '2026-11-25 09:32:52.802', '2026-11-25 09:32:52.802'),
('e0fd2a02-33d4-41d3-919e-70e66b95702d', 'ace0b629-cae7-4260-93af-3643d8d3dd58', '{{Attorney.Name}}', 'ResponsibleAttorney', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:23:14.204', '2026-11-25 09:23:14.204'),
('e10383f3-1554-485d-8c2b-991f1203d642', '65587343-3be5-4fb8-949e-9ec79b5633e9', '{{Matter.MatterNumber}}', 'Matter', 'matterNumber', 1, NULL, 'NONE', NULL, '2026-11-25 09:30:59.762', '2026-11-25 09:30:59.762'),
('e10bb264-7914-48a4-a2d1-4bded57832dc', '6e54ec21-da29-449d-bae3-5e59a42baf6b', '{{Matter.MatterNumber}}', 'Matter', 'matterNumber', 1, NULL, 'NONE', NULL, '2026-11-25 09:36:41.403', '2026-11-25 09:36:41.403'),
('e1277e96-33cb-4fab-890b-2c2c0c468245', 'bdca2373-61f4-4959-92a9-51597dde69c2', '{{Client.Name}}', 'Client', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:24:25.273', '2026-11-25 09:24:25.273'),
('e1306828-d9d1-4523-b469-6fd093da08b3', '91dfe486-8f7a-471b-a46a-742db2f4e416', '{{Matter.Title}}', 'Matter', 'title', 1, NULL, 'NONE', NULL, '2026-11-25 09:08:30.402', '2026-11-25 09:08:30.402'),
('e16ce903-a654-49e9-9925-665edc872312', 'a82ecdb1-9acb-40ed-a3e9-b39f93371ff7', '{{Attorney.Name}}', 'ResponsibleAttorney', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:32:16.690', '2026-11-25 09:32:16.690'),
('e19d4a8a-7a25-4da5-be4b-8c799d250835', '27f17c2f-55ae-406c-8d5d-1cde5931934d', '{{Attorney.Name}}', 'ResponsibleAttorney', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:31:06.958', '2026-11-25 09:31:06.958'),
('e1b55548-18a2-4631-8c60-59cab5c0dea7', '7c968a6f-a8ff-49dd-a563-671184d476f0', '{{Matter.MatterNumber}}', 'Matter', 'matterNumber', 1, NULL, 'NONE', NULL, '2026-11-25 09:10:37.449', '2026-11-25 09:10:37.449'),
('e1ce3e86-4a29-40a9-b173-344bdc79c5a0', '5e4e18a0-301e-4bb3-865b-43e3f87e3ac7', '{{Matter.MatterNumber}}', 'Matter', 'matterNumber', 1, NULL, 'NONE', NULL, '2026-11-25 09:09:59.969', '2026-11-25 09:09:59.969'),
('e2343530-5c0f-453d-942f-4ccf7191e0f4', 'd4dbbe74-9882-4019-a375-d6771172c7ce', '{{Matter.MatterNumber}}', 'Matter', 'matterNumber', 1, NULL, 'NONE', NULL, '2026-11-25 09:26:44.761', '2026-11-25 09:26:44.761'),
('e23af5c5-b96c-41e5-a7c6-087ab4d43afb', '8beb6f2e-6342-4443-b215-aaa6e92c6614', '{{Matter.Title}}', 'Matter', 'title', 1, NULL, 'NONE', NULL, '2026-11-25 09:07:05.165', '2026-11-25 09:07:05.165'),
('e2cee1e7-3937-47cc-8a9b-38e4ff0d8999', '02dd54d6-98d0-413c-8b37-8b1dd6a1369d', '{{Client.Name}}', 'Client', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:44:21.971', '2026-11-25 09:44:21.971'),
('e3827ffb-1568-4525-8945-78442ef4a657', 'a8148ce8-8831-4767-aa6a-677772967a2a', '{{Matter.MatterNumber}}', 'Matter', 'matterNumber', 1, NULL, 'NONE', NULL, '2026-11-25 09:44:28.526', '2026-11-25 09:44:28.526'),
('e3fa736a-0a98-4395-8d8a-2b166bc207fc', '0a100241-1565-4041-8f2b-b25c3d3292a6', '{{Matter.Title}}', 'Matter', 'title', 1, NULL, 'NONE', NULL, '2026-11-25 09:11:37.540', '2026-11-25 09:11:37.540'),
('e415a8f7-8b0f-49d8-ab3c-503e7a925254', '9f876323-e455-4913-9232-d561ae223b81', '{{Client.Name}}', 'Client', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:36:49.099', '2026-11-25 09:36:49.099'),
('e41df2c3-7ecd-4b66-aeb5-485814cfd9b6', '8a3a335c-5720-4c7a-8b84-63dd8464de50', '{{Attorney.Name}}', 'ResponsibleAttorney', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:07:43.776', '2026-11-25 09:07:43.776'),
('e45ce53b-af95-4871-b0d2-d4bc63120ced', 'c13d06b7-cb6f-4b97-9815-76bbe6828bf1', '{{Attorney.Name}}', 'ResponsibleAttorney', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:33:09.779', '2026-11-25 09:33:09.779'),
('e47287f5-17e9-4984-90e4-c36398fcee01', '53ff8796-c10e-45df-b002-dfdaf2e6f77a', '{{Client.Name}}', 'Client', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:16:26.633', '2026-11-25 09:16:26.633'),
('e4de1467-2a63-413d-8e59-26a8d41e6a08', '54999649-7637-42ef-bd53-49354c07f773', '{{Matter.MatterNumber}}', 'Matter', 'matterNumber', 1, NULL, 'NONE', NULL, '2026-11-25 09:33:38.395', '2026-11-25 09:33:38.395'),
('e4f22b80-fce9-45c5-991e-a0dc439bd695', 'abc8d0dd-9195-4d6d-a0b6-0813f8842c54', '{{Client.Name}}', 'Client', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:34:10.516', '2026-11-25 09:34:10.516'),
('e50e4239-7990-42c2-a9fd-48e61652035e', 'c77fdadd-a9dd-4297-a2c5-a67b52493e36', '{{Matter.MatterNumber}}', 'Matter', 'matterNumber', 1, NULL, 'NONE', NULL, '2026-11-25 09:45:35.888', '2026-11-25 09:45:35.888'),
('e5106d4b-213f-4596-8555-ca5d2fe9f695', 'aaadd169-b1e0-4879-acd9-7d4901b33831', '{{CurrentDate.Long}}', 'CurrentDate', 'long', 0, NULL, 'NONE', NULL, '2026-11-25 09:23:06.532', '2026-11-25 09:23:06.532'),
('e517167e-1732-45d1-a95d-5e2e05dd513b', 'fe7b7db2-ab5b-4c22-bbd9-6c48fb296c01', '{{Matter.Title}}', 'Matter', 'title', 1, NULL, 'NONE', NULL, '2026-11-25 09:25:15.933', '2026-11-25 09:25:15.933'),
('e51eec94-5ed7-4218-840a-32256d491e22', '3d32beda-4c29-4858-a945-a78c68a9eb1c', '{{Client.Name}}', 'Client', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:19:04.418', '2026-11-25 09:19:04.418'),
('e54ad162-55e3-49ba-aba9-a06427eb6683', '2c0605e3-233d-47b9-b595-5dc7dedf36a1', '{{Matter.Title}}', 'Matter', 'title', 1, NULL, 'NONE', NULL, '2026-11-25 09:39:01.771', '2026-11-25 09:39:01.771'),
('e54b603a-af76-43e1-abfb-6053442f48ba', 'a7792ca7-8658-4169-85b1-dbda0042f131', '{{Matter.MatterNumber}}', 'Matter', 'matterNumber', 1, NULL, 'NONE', NULL, '2026-11-25 09:37:27.290', '2026-11-25 09:37:27.290'),
('e5538ebd-b4e9-4237-8b0e-b2b391756b94', '57a5bfb2-dd4c-4b48-84be-e2d51eb69b99', '{{CurrentDate.Long}}', 'CurrentDate', 'long', 0, NULL, 'NONE', NULL, '2026-11-25 09:22:53.102', '2026-11-25 09:22:53.102'),
('e5a1b49a-7a54-42f5-97f3-a516596e52f2', 'a7792ca7-8658-4169-85b1-dbda0042f131', '{{Client.Name}}', 'Client', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:37:27.290', '2026-11-25 09:37:27.290'),
('e5a3b010-9aa5-42ac-8044-46df0ea8dc86', '2aaef701-5ea8-42cc-b381-3aad1aaac0e3', '{{Client.Name}}', 'Client', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:11:16.455', '2026-11-25 09:11:16.455'),
('e5eb9132-6419-43da-a048-8e956900ab2e', 'c4ec8be5-740c-4049-8d6c-d5e7b3c66983', 'Matter.Title', 'Matter', 'title', 1, NULL, 'NONE', NULL, '2026-11-14 09:29:59.262', '2026-11-14 09:29:59.262'),
('e69c0be9-9b44-490d-96b7-e26109183a96', '7e69c06a-139d-48d6-af7c-bbbc8ff7cf3f', '{{Attorney.Name}}', 'ResponsibleAttorney', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:45:17.740', '2026-11-25 09:45:17.740'),
('e6a21a5a-45c4-436f-a79a-7188c6d80644', '5361481e-129a-40d6-9934-520daeffbe6a', '{{Matter.Title}}', 'Matter', 'title', 1, NULL, 'NONE', NULL, '2026-11-25 09:32:09.257', '2026-11-25 09:32:09.257'),
('e6a53b5a-9b54-49ca-a216-9286e17cae57', 'bec4931d-f5eb-4ac4-97a7-204023385706', '{{Matter.Title}}', 'Matter', 'title', 1, NULL, 'NONE', NULL, '2026-11-25 09:20:10.391', '2026-11-25 09:20:10.391'),
('e6ca0f9e-7cb1-42b2-8c87-a10d67a12a16', 'c13d06b7-cb6f-4b97-9815-76bbe6828bf1', '{{Matter.Title}}', 'Matter', 'title', 1, NULL, 'NONE', NULL, '2026-11-25 09:33:09.779', '2026-11-25 09:33:09.779'),
('e6e4b141-6143-430f-bc94-ed7e9a126f08', '646b3030-53a2-4823-8beb-0a9acb9a9610', '{{Attorney.Name}}', 'ResponsibleAttorney', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:41:09.163', '2026-11-25 09:41:09.163'),
('e74f600e-a8f5-4c96-8ce0-b39a59e92775', '241fd3a3-0135-4a8b-a617-c23cdff79820', '{{Matter.Title}}', 'Matter', 'title', 1, NULL, 'NONE', NULL, '2026-11-25 09:33:50.854', '2026-11-25 09:33:50.854'),
('e75fbd92-fdb6-43ce-b4f0-4e3c55e6ad82', '7c065d2e-46e5-4be9-8aca-231b61f602ae', '{{CurrentDate.Long}}', 'CurrentDate', 'long', 0, NULL, 'NONE', NULL, '2026-11-25 09:18:27.169', '2026-11-25 09:18:27.169'),
('e797ab8e-7e2c-4a13-8497-46a6b2397a44', '5e4ca444-af6e-4f60-a8d2-89e32991db04', '{{Client.Name}}', 'Client', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:40:15.393', '2026-11-25 09:40:15.393'),
('e7f74cfb-5ea0-473e-9bec-1c54b6189e67', '33c3b86e-3b0c-4b3a-a5f3-15a26b0395d5', '{{Matter.Title}}', 'Matter', 'title', 1, NULL, 'NONE', NULL, '2026-11-25 09:13:55.497', '2026-11-25 09:13:55.497'),
('e81caa03-a5ce-464c-983c-d3b3eb26bea0', '337aeffc-4ece-4ce7-82a5-d6b928eefac4', '{{Matter.Title}}', 'Matter', 'title', 1, NULL, 'NONE', NULL, '2026-11-25 09:09:02.748', '2026-11-25 09:09:02.748'),
('e85ae1e9-ca97-475b-8867-a60a51b90524', 'f5baa4d4-c567-40bb-a6da-9bc4cd478cb2', '{{Attorney.Name}}', 'ResponsibleAttorney', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:30:20.873', '2026-11-25 09:30:20.873'),
('e87f0dd2-015f-4051-a400-9d7e4cde6889', 'fb67f315-9816-4b39-a52a-f04d70347eb8', '{{Matter.Title}}', 'Matter', 'title', 1, NULL, 'NONE', NULL, '2026-11-25 09:42:30.175', '2026-11-25 09:42:30.175'),
('e8cf0706-3078-4cdb-825f-110e89bd6f53', '624c4276-dd94-475c-b02b-8aadc8109363', '{{Attorney.Name}}', 'ResponsibleAttorney', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:27:54.188', '2026-11-25 09:27:54.188'),
('e91d50f7-920a-40df-98ad-f35066c8beb0', 'b3fa3129-564d-4926-a813-3f343805c94e', '{{Client.Name}}', 'Client', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:15:02.998', '2026-11-25 09:15:02.998'),
('e95e1baa-b98e-414e-88f0-544cb32bcb08', 'ab0ef57c-1551-4441-b538-de13cf647a2b', '{{Client.Name}}', 'Client', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:08:39.470', '2026-11-25 09:08:39.470'),
('e977981f-f0ed-4a9a-9cfe-bb8bf7798b29', '7e30837a-d454-41ca-9705-e2a4f1ceccf7', '{{Attorney.Name}}', 'ResponsibleAttorney', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:43:52.167', '2026-11-25 09:43:52.167'),
('e9809b6a-0668-40f2-978a-9a89e6e0947e', '2921473b-3172-4a76-9567-4533d18df0a9', '{{Matter.MatterNumber}}', 'Matter', 'matterNumber', 1, NULL, 'NONE', NULL, '2026-11-25 09:18:33.651', '2026-11-25 09:18:33.651'),
('e99e1b40-8363-4e3d-8b27-89e0f6fbecb8', 'a82ecdb1-9acb-40ed-a3e9-b39f93371ff7', '{{Client.Name}}', 'Client', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:32:16.690', '2026-11-25 09:32:16.690'),
('ea0d5a3c-28fe-439c-a821-37ca0c09680b', '711d7253-2ea0-4e60-81b3-fb542fd7c2fa', '{{Insurance.ClaimNumber}}', 'Insurance', 'claimNumber', 0, NULL, 'NONE', NULL, '2026-11-25 09:13:17.503', '2026-11-25 09:13:17.503'),
('ea3361d4-0812-493a-8921-b13ad5c597f3', 'd7c3f728-e7aa-4abb-82e1-b77e855808b2', '{{Court.Name}}', 'Court', 'name', 0, NULL, 'NONE', NULL, '2026-11-25 09:36:33.810', '2026-11-25 09:36:33.810'),
('ea4a11a2-8319-48f1-9674-d106eedbaa79', '5e4ca444-af6e-4f60-a8d2-89e32991db04', '{{Matter.MatterNumber}}', 'Matter', 'matterNumber', 1, NULL, 'NONE', NULL, '2026-11-25 09:40:15.393', '2026-11-25 09:40:15.393'),
('ea4d0a9b-09af-4e96-aa3c-72319ac07749', '6f4e7b2b-9b59-419e-9e16-9a91ef17a6ad', '{{Matter.MatterNumber}}', 'Matter', 'matterNumber', 1, NULL, 'NONE', NULL, '2026-11-25 09:35:44.995', '2026-11-25 09:35:44.995'),
('ea55d69e-33ad-4933-827a-056c169b56ec', '6f4e7b2b-9b59-419e-9e16-9a91ef17a6ad', '{{Attorney.Name}}', 'ResponsibleAttorney', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:35:44.995', '2026-11-25 09:35:44.995'),
('ea6b68c0-a339-4de8-93dc-a008c5dd0a41', '55c75bd5-de4c-42aa-8bef-cc597dec5070', '{{Client.Name}}', 'Client', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:40:56.254', '2026-11-25 09:40:56.254'),
('ea8cb799-d4ef-462d-b8ae-b2e8323a4af0', 'd26b2d0a-875b-440e-bdd0-98d209b395f6', '{{Incident.AccidentDate}}', 'Incident', 'accidentDate', 0, NULL, 'DATE_LONG', NULL, '2026-11-25 09:21:57.086', '2026-11-25 09:21:57.086'),
('ea903bc9-a7f6-40fa-8129-41452f7dbbeb', '85a9dc73-04a9-429c-bea2-9b6c30b6f1b8', '{{Matter.MatterNumber}}', 'Matter', 'matterNumber', 1, NULL, 'NONE', NULL, '2026-11-25 09:16:06.548', '2026-11-25 09:16:06.548'),
('ea9b97b3-b369-4405-9955-626c568f06df', '9692a5aa-2e76-4c88-bb31-9f2573946b83', '{{Matter.MatterNumber}}', 'Matter', 'matterNumber', 1, NULL, 'NONE', NULL, '2026-11-25 09:09:30.940', '2026-11-25 09:09:30.940');
INSERT INTO `document_field_mappings` (`id`, `template_version_id`, `placeholder_tag`, `source_entity`, `source_field`, `is_required`, `default_value`, `formatting_rule`, `conditional_expression`, `created_at`, `updated_at`) VALUES
('eab8b7ca-0062-41ba-9716-9e9a62325481', '3cdd654e-d99e-42e9-a77a-8687e4163a1f', '{{Matter.Title}}', 'Matter', 'title', 1, NULL, 'NONE', NULL, '2026-11-25 09:11:47.534', '2026-11-25 09:11:47.534'),
('eabb4cf0-1389-434f-866e-01ee48ecd2c4', '1aacba72-d077-47f3-b2b7-079f6780add0', '{{Matter.MatterNumber}}', 'Matter', 'matterNumber', 1, NULL, 'NONE', NULL, '2026-11-25 09:14:44.454', '2026-11-25 09:14:44.454'),
('eb1c8a36-fb54-4b50-bdab-6151e85ba7fe', 'ffd84a63-15dd-4736-ac53-3cdf07c061d1', '{{Attorney.Name}}', 'ResponsibleAttorney', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:06:41.631', '2026-11-25 09:06:41.631'),
('eb223176-e7a5-4b66-9298-88b77a8f8c23', 'd25581db-9683-4af4-be68-eb539366297e', '{{Matter.Title}}', 'Matter', 'title', 1, NULL, 'NONE', NULL, '2026-11-25 09:11:28.516', '2026-11-25 09:11:28.516'),
('eb2c0181-9296-45c1-905f-8b063ff0235c', 'f0f60427-2e97-4056-bd3a-cf9f245eae61', '{{Matter.Title}}', 'Matter', 'title', 1, NULL, 'NONE', NULL, '2026-11-25 09:38:53.675', '2026-11-25 09:38:53.675'),
('eb41fd84-7f61-49bc-8803-dd65a0b5cc16', 'f044998e-94c8-4a24-8776-9ffddfc146af', '{{Matter.Title}}', 'Matter', 'title', 1, NULL, 'NONE', NULL, '2026-11-25 09:40:49.866', '2026-11-25 09:40:49.866'),
('eb546b99-7cfb-4a7c-8107-9582c3961440', 'bdca2373-61f4-4959-92a9-51597dde69c2', '{{Matter.MatterNumber}}', 'Matter', 'matterNumber', 1, NULL, 'NONE', NULL, '2026-11-25 09:24:25.273', '2026-11-25 09:24:25.273'),
('ec2a682e-e0bc-4e37-8e1c-41a5f3add4a0', '3f0f23bb-0dd8-403d-ae37-f520c2cf7c4c', '{{Matter.MatterNumber}}', 'Matter', 'matterNumber', 1, NULL, 'NONE', NULL, '2026-11-25 09:13:30.201', '2026-11-25 09:13:30.201'),
('ec354218-776f-409e-bd0a-baf5ee8b14bf', '73efedfc-9f48-4cbe-960a-523e0de00400', '{{Matter.Title}}', 'Matter', 'title', 1, NULL, 'NONE', NULL, '2026-11-25 09:21:03.947', '2026-11-25 09:21:03.947'),
('ec442603-5a71-4e45-a933-81ed0a2f3006', 'cda60690-b708-484d-b818-da492d1ec9f4', '{{Attorney.Name}}', 'ResponsibleAttorney', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:20:00.458', '2026-11-25 09:20:00.458'),
('ec48438f-39c6-41ea-9aaf-10f189d56dc5', '9b60b515-2a6b-443d-b1b4-b9be39c9cbff', '{{Matter.MatterNumber}}', 'Matter', 'matterNumber', 1, NULL, 'NONE', NULL, '2026-11-25 09:45:10.533', '2026-11-25 09:45:10.533'),
('ec4ad0d7-3a55-4513-b6e8-19744c4e2760', 'fe7b7db2-ab5b-4c22-bbd9-6c48fb296c01', '{{Demand.DemandedAmount}}', 'Demand', 'demandedAmount', 0, NULL, 'CURRENCY_USD', NULL, '2026-11-25 09:25:15.933', '2026-11-25 09:25:15.933'),
('ecdc176d-10f1-4a9c-bb3e-6812b17bf573', '24be09a7-7d8c-4d14-a6ad-4438cf0d12d8', '{{Matter.Title}}', 'Matter', 'title', 1, NULL, 'NONE', NULL, '2026-11-25 09:28:22.849', '2026-11-25 09:28:22.849'),
('ed25b917-6fa2-43fd-a958-f728f926c21a', 'e7250e39-5976-4061-9be3-c776a91a40d3', '{{Insurance.ClaimNumber}}', 'Insurance', 'claimNumber', 0, NULL, 'NONE', NULL, '2026-11-25 09:27:08.713', '2026-11-25 09:27:08.713'),
('ed7c3b12-67f5-4f20-94a9-13b5f67da156', '1f4de991-5e27-4cca-97fb-d30b56289a97', '{{Attorney.Name}}', 'ResponsibleAttorney', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:17:54.539', '2026-11-25 09:17:54.539'),
('ed9549f0-c454-458a-90ff-6d19ab627c6b', '8550fd39-39c9-46e4-ac0d-b95d3ed4d125', '{{Matter.Title}}', 'Matter', 'title', 1, NULL, 'NONE', NULL, '2026-11-25 09:36:56.022', '2026-11-25 09:36:56.022'),
('edb9a814-7ce1-4163-9c37-a92b276c2505', '38802e64-abb7-4888-9103-69a8af7f72da', '{{Client.Name}}', 'Client', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:27:34.610', '2026-11-25 09:27:34.610'),
('ee47e3ba-0e9d-4e92-974e-a38b08f62e6c', '863ecb6b-acb2-468e-8280-6869008e38c4', '{{Insurance.ClaimNumber}}', 'Insurance', 'claimNumber', 0, NULL, 'NONE', NULL, '2026-11-25 09:25:40.453', '2026-11-25 09:25:40.453'),
('ee4e8998-734a-48d9-a076-62a5ed6e3eff', 'cf3f8036-b51a-4805-9815-f7e0ab87f802', '{{Client.Name}}', 'Client', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:25:10.406', '2026-11-25 09:25:10.406'),
('ee53ab9e-ce5a-4431-9edb-27f77d2425cc', '88dbdb77-3188-4699-801b-9f4553338ebf', '{{Matter.MatterNumber}}', 'Matter', 'matterNumber', 1, NULL, 'NONE', NULL, '2026-11-25 09:31:41.857', '2026-11-25 09:31:41.857'),
('eedf5884-0f95-49c8-886c-22e245ae6375', 'fb08ce84-4c18-4837-b721-a23609d55a88', '{{Client.Name}}', 'Client', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:07:54.843', '2026-11-25 09:07:54.843'),
('ef8fa1a5-791b-4b51-9a66-36c6aec8840d', 'a7792ca7-8658-4169-85b1-dbda0042f131', '{{Attorney.Name}}', 'ResponsibleAttorney', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:37:27.290', '2026-11-25 09:37:27.290'),
('ef97c71f-f50d-4a4f-80b8-249b8176926d', 'c74c8d8a-da5f-45a1-b4d9-37382fa0edc7', '{{Matter.Title}}', 'Matter', 'title', 1, NULL, 'NONE', NULL, '2026-11-25 09:07:28.820', '2026-11-25 09:07:28.820'),
('efa4bb16-50ab-4b4c-9a98-9d31996cd998', '1ec6c840-2b23-40bf-a2ae-7145c973e095', '{{Attorney.Name}}', 'ResponsibleAttorney', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:41:39.010', '2026-11-25 09:41:39.010'),
('efab8561-5d43-452e-81f1-28509ba84333', 'c64b8f15-6e35-40c5-8c00-789f96d081f5', '{{Attorney.Name}}', 'ResponsibleAttorney', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:29:54.499', '2026-11-25 09:29:54.499'),
('efd1eda7-a511-4984-9da7-df5be9d1fa94', 'd24a965c-788a-4dc5-93f8-b25f2bcc6604', '{{Attorney.Name}}', 'ResponsibleAttorney', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:15:39.655', '2026-11-25 09:15:39.655'),
('efe7b11d-2463-494b-8574-784f943e364b', '7c065d2e-46e5-4be9-8aca-231b61f602ae', '{{Matter.MatterNumber}}', 'Matter', 'matterNumber', 1, NULL, 'NONE', NULL, '2026-11-25 09:18:27.169', '2026-11-25 09:18:27.169'),
('eff1180f-5b3a-4a5f-806e-89b58cf1b234', 'fd5a203a-5e69-48fa-b56e-5f807c102f1f', '{{Incident.AccidentDate}}', 'Incident', 'accidentDate', 0, NULL, 'DATE_LONG', NULL, '2026-11-25 09:22:11.842', '2026-11-25 09:22:11.842'),
('eff1b089-31c4-47e3-81d9-3d6132e9a261', '784a0a67-2de8-47ac-bd8f-7b457bd3e5ce', '{{Attorney.Name}}', 'ResponsibleAttorney', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:08:48.958', '2026-11-25 09:08:48.958'),
('f0120a8e-fe64-4cf7-aa60-b53b59502f7c', '5361481e-129a-40d6-9934-520daeffbe6a', '{{Client.Name}}', 'Client', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:32:09.257', '2026-11-25 09:32:09.257'),
('f026a63c-8e7b-43ea-a81d-79cc71fc699c', '64dd38ea-8636-4110-ada9-9363f9452197', '{{Insurance.ClaimNumber}}', 'Insurance', 'claimNumber', 0, NULL, 'NONE', NULL, '2026-11-25 09:28:29.468', '2026-11-25 09:28:29.468'),
('f05054fd-881f-447f-bd64-d449dcf4a526', 'f1ae8218-aa51-4131-8ef6-0c719f6c8747', '{{Client.Name}}', 'Client', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:13:47.034', '2026-11-25 09:13:47.034'),
('f084f767-3a89-417e-9c9f-655e86328ac1', 'f512924e-1ce1-4f7c-8a32-1b102bed96b8', '{{Matter.MatterNumber}}', 'Matter', 'matterNumber', 1, NULL, 'NONE', NULL, '2026-11-25 09:21:39.574', '2026-11-25 09:21:39.574'),
('f0c6567b-188c-48a7-a656-9b1cb361aba3', 'a967c641-7597-468e-bfa1-bccc3668a316', '{{Attorney.Name}}', 'ResponsibleAttorney', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:23:57.599', '2026-11-25 09:23:57.599'),
('f0ca3c75-fc96-40b2-8d58-4deace602e1c', '9024acc9-4c92-4c96-b980-7c11389d10a9', '{{Matter.Title}}', 'Matter', 'title', 1, NULL, 'NONE', NULL, '2026-11-25 09:38:02.180', '2026-11-25 09:38:02.180'),
('f0d6b406-5924-482a-bfdf-cea9b8dc4ca3', 'a6c30529-d5fe-4ef6-88f7-5646308ae386', '{{Client.Name}}', 'Client', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:30:28.757', '2026-11-25 09:30:28.757'),
('f10ae91b-5e49-4084-8ce5-a46f71b73262', '3bbc2c93-4f93-48e7-828d-2a34553167e2', '{{Matter.Title}}', 'Matter', 'title', 1, NULL, 'NONE', NULL, '2026-11-25 09:16:01.257', '2026-11-25 09:16:01.257'),
('f1765868-4637-4c35-8c7a-affd645555ce', '94cd0be6-7b2b-46b8-bf0c-2afb31db795c', '{{Matter.MatterNumber}}', 'Matter', 'matterNumber', 1, NULL, 'NONE', NULL, '2026-11-25 09:17:06.680', '2026-11-25 09:17:06.680'),
('f18e9c8e-631d-48ba-99e3-7bbc9c437f9f', 'a967c641-7597-468e-bfa1-bccc3668a316', '{{Matter.Title}}', 'Matter', 'title', 1, NULL, 'NONE', NULL, '2026-11-25 09:23:57.599', '2026-11-25 09:23:57.599'),
('f1b53004-d980-48f1-9523-daf0207a0b2e', '9f876323-e455-4913-9232-d561ae223b81', '{{Matter.Title}}', 'Matter', 'title', 1, NULL, 'NONE', NULL, '2026-11-25 09:36:49.099', '2026-11-25 09:36:49.099'),
('f1cb85e0-c308-49ba-9b61-37667823ba92', '05d6bd45-cbbf-4e86-852e-fac15162a534', '{{Attorney.Name}}', 'ResponsibleAttorney', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:42:45.141', '2026-11-25 09:42:45.141'),
('f1f8218e-7970-432d-82d8-783656ab857f', '82f334d4-a724-4cf7-834d-e7ffeb29d708', '{{Matter.Title}}', 'Matter', 'title', 1, NULL, 'NONE', NULL, '2026-11-25 09:43:26.986', '2026-11-25 09:43:26.986'),
('f248c5ef-29b8-40dd-9c9e-f74186b63a99', 'c77fdadd-a9dd-4297-a2c5-a67b52493e36', '{{Client.Name}}', 'Client', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:45:35.888', '2026-11-25 09:45:35.888'),
('f26eedec-ae42-4da7-8a1b-94b06a420160', 'cc5d287b-035c-4bbb-8ad8-7cc0051ffb46', '{{Matter.Title}}', 'Matter', 'title', 1, NULL, 'NONE', NULL, '2026-11-25 09:30:52.249', '2026-11-25 09:30:52.249'),
('f2812bec-e768-4036-b590-7dfd871bcbf6', 'a2db730d-4dbc-4106-919b-fc0360d36f16', '{{Attorney.Name}}', 'ResponsibleAttorney', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:17:25.046', '2026-11-25 09:17:25.046'),
('f28dcf47-40f9-4fe5-b847-bac64acdf358', 'aae4c646-eab5-45dd-97ce-81bb12c1077d', '{{Attorney.Name}}', 'ResponsibleAttorney', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:31:24.862', '2026-11-25 09:31:24.862'),
('f3118daf-8036-428a-adee-96dbab46accb', '4bbb16ac-a0c8-4ead-87b5-1d3fd4c9997c', '{{Matter.MatterNumber}}', 'Matter', 'matterNumber', 1, NULL, 'NONE', NULL, '2026-11-25 09:41:23.875', '2026-11-25 09:41:23.875'),
('f31dad55-4850-4222-9b65-4c6702fb592c', 'b3fa3129-564d-4926-a813-3f343805c94e', '{{Attorney.Name}}', 'ResponsibleAttorney', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:15:02.998', '2026-11-25 09:15:02.998'),
('f37b3c63-8225-4185-818b-3822a4857939', '46f31fd0-867e-4edf-bacc-1923e699b8ac', '{{Attorney.Name}}', 'ResponsibleAttorney', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:10:46.357', '2026-11-25 09:10:46.357'),
('f3f17949-4cac-499e-b5b4-57aca12459e5', 'c74c8d8a-da5f-45a1-b4d9-37382fa0edc7', '{{Attorney.Name}}', 'ResponsibleAttorney', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:07:28.820', '2026-11-25 09:07:28.820'),
('f402143a-edaa-4eba-8db5-167c982bf9b1', 'e156defb-48fa-424a-9036-9fbb2c624c41', '{{Matter.MatterNumber}}', 'Matter', 'matterNumber', 1, NULL, 'NONE', NULL, '2026-11-25 09:23:43.289', '2026-11-25 09:23:43.289'),
('f42a1a32-3410-43ce-b769-541c6ea3f22a', '1ae6da1a-7516-477c-9e1b-7ffeafd1bcb6', '{{Attorney.Name}}', 'ResponsibleAttorney', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:27:47.278', '2026-11-25 09:27:47.278'),
('f43ff534-c7e2-4d32-9548-a8918c3bb19a', '38802e64-abb7-4888-9103-69a8af7f72da', '{{Matter.Title}}', 'Matter', 'title', 1, NULL, 'NONE', NULL, '2026-11-25 09:27:34.610', '2026-11-25 09:27:34.610'),
('f4546f23-6b2a-4c8b-b0e4-4369ae0896a9', '4bc4828e-f99f-4897-9448-cd2ad8e39c37', '{{Attorney.Name}}', 'ResponsibleAttorney', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:45:03.790', '2026-11-25 09:45:03.790'),
('f47106e8-b032-4036-ac83-0395e0c7df66', '8eaaf587-a871-4b9d-ba8a-54e4e38e7234', '{{Client.Name}}', 'Client', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:41:15.701', '2026-11-25 09:41:15.701'),
('f4752ffb-5524-4cea-bcae-062eb0f163e1', '5d439c99-f896-4a7f-99e9-3f7c2bf237a9', '{{MedicalProvider.Name}}', 'MedicalProvider', 'name', 0, NULL, 'NONE', NULL, '2026-11-25 09:20:48.401', '2026-11-25 09:20:48.401'),
('f4aeaf68-b8c5-4b24-beaa-bbf773bc38f7', 'ed751d5b-ec83-4cc5-a512-32cd82650602', '{{Matter.Title}}', 'Matter', 'title', 1, NULL, 'NONE', NULL, '2026-11-25 09:41:49.879', '2026-11-25 09:41:49.879'),
('f564731c-f4e7-4a7a-9243-10be5175c12c', 'f1ae8218-aa51-4131-8ef6-0c719f6c8747', '{{Matter.Title}}', 'Matter', 'title', 1, NULL, 'NONE', NULL, '2026-11-25 09:13:47.034', '2026-11-25 09:13:47.034'),
('f56ebb98-5f4b-4620-988c-7489fd8217cf', '5d6da4fd-169a-4e72-a1f3-88e6ab30e6af', '{{Client.Name}}', 'Client', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:18:40.684', '2026-11-25 09:18:40.684'),
('f5902c89-5275-41fd-9735-997a51dcc4f5', 'a1ae9879-d795-4d25-b0fc-2536ccb1031e', '{{Attorney.Name}}', 'ResponsibleAttorney', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:12:38.790', '2026-11-25 09:12:38.790'),
('f5eb183d-4467-43fc-821d-9fd4dbb51cfc', 'f1ae8218-aa51-4131-8ef6-0c719f6c8747', '{{Matter.MatterNumber}}', 'Matter', 'matterNumber', 1, NULL, 'NONE', NULL, '2026-11-25 09:13:47.034', '2026-11-25 09:13:47.034'),
('f6250a05-0582-4179-978f-ab317773acd0', '6aff411c-53cc-4f49-bda2-ecaad33a950c', '{{Client.Name}}', 'Client', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:43:59.878', '2026-11-25 09:43:59.878'),
('f6319354-a4e3-4929-8cfc-872e84eda827', '4f9a81a9-9252-4774-9e0a-dd01e6c80ac9', '{{Matter.Title}}', 'Matter', 'title', 1, NULL, 'NONE', NULL, '2026-11-25 09:11:54.187', '2026-11-25 09:11:54.187'),
('f641f21b-5808-43ad-9b20-a7f0de87c8e3', 'b849065e-953a-4107-b563-5df696d006f2', '{{Attorney.Name}}', 'ResponsibleAttorney', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:15:19.926', '2026-11-25 09:15:19.926'),
('f65497ee-30d2-48b3-8f12-d4dd4c9cd967', '328ff179-ebf1-42aa-ad4b-5453495df5ce', '{{Attorney.Name}}', 'ResponsibleAttorney', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:16:33.611', '2026-11-25 09:16:33.611'),
('f669efc2-bd86-45a0-8a75-08c5d37f36b7', '27f73e77-5dbf-4beb-947f-2cac6003fbd8', '{{CurrentDate.Long}}', 'CurrentDate', 'long', 0, NULL, 'NONE', NULL, '2026-11-25 09:12:56.213', '2026-11-25 09:12:56.213'),
('f6700b83-9c95-42f1-b5c7-ecea35f8d9c9', '646b3030-53a2-4823-8beb-0a9acb9a9610', '{{Client.Name}}', 'Client', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:41:09.163', '2026-11-25 09:41:09.163'),
('f6941156-0dd7-4dd4-8d71-30710bad7fb1', '5ba7f4b1-3bfe-41f2-b66a-9d4d563937e2', '{{Matter.MatterNumber}}', 'Matter', 'matterNumber', 1, NULL, 'NONE', NULL, '2026-11-25 09:29:43.089', '2026-11-25 09:29:43.089'),
('f6c5b4cd-cca4-44bd-89ea-351960f616c6', '9692a5aa-2e76-4c88-bb31-9f2573946b83', '{{Client.Name}}', 'Client', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:09:30.940', '2026-11-25 09:09:30.940'),
('f7165e65-ce42-419e-a3d7-3098bcd17ec5', 'fb67f315-9816-4b39-a52a-f04d70347eb8', '{{Matter.MatterNumber}}', 'Matter', 'matterNumber', 1, NULL, 'NONE', NULL, '2026-11-25 09:42:30.175', '2026-11-25 09:42:30.175'),
('f716f11a-79d8-4dfb-851f-cb2ae1b33869', '7e69c06a-139d-48d6-af7c-bbbc8ff7cf3f', '{{Matter.Title}}', 'Matter', 'title', 1, NULL, 'NONE', NULL, '2026-11-25 09:45:17.740', '2026-11-25 09:45:17.740'),
('f75250e2-13ad-4994-b1f7-39de3617b445', '04d4f9e6-5cb9-430c-9102-a9532ca61256', '{{Attorney.Name}}', 'ResponsibleAttorney', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:27:59.859', '2026-11-25 09:27:59.859'),
('f76d6478-8ff0-4e63-ab67-193e23da2ec8', '6aff411c-53cc-4f49-bda2-ecaad33a950c', '{{Matter.Title}}', 'Matter', 'title', 1, NULL, 'NONE', NULL, '2026-11-25 09:43:59.878', '2026-11-25 09:43:59.878'),
('f78480cd-8311-416e-a9e2-0e5e67560063', 'a2db730d-4dbc-4106-919b-fc0360d36f16', '{{Matter.Title}}', 'Matter', 'title', 1, NULL, 'NONE', NULL, '2026-11-25 09:17:25.046', '2026-11-25 09:17:25.046'),
('f7c54572-c6c0-46a1-9c65-9777b7363355', '5dc8f9f7-ab83-4e49-bd46-3760dd97a48f', '{{Attorney.Name}}', 'ResponsibleAttorney', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:32:01.647', '2026-11-25 09:32:01.647'),
('f7e8fecf-d501-47fe-bb3d-11316001fcb1', '25cda274-07df-4c65-88da-f1ff8e45e0dd', '{{Client.Name}}', 'Client', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:22:36.613', '2026-11-25 09:22:36.613'),
('f8302eec-a024-4427-9a84-c9a79e627087', '54999649-7637-42ef-bd53-49354c07f773', '{{Matter.Title}}', 'Matter', 'title', 1, NULL, 'NONE', NULL, '2026-11-25 09:33:38.395', '2026-11-25 09:33:38.395'),
('f836304f-749f-455d-82a7-4aabd38a1469', '7f58167b-7eb3-464f-8b2e-1555bb0b09f6', '{{Client.Name}}', 'Client', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:28:06.109', '2026-11-25 09:28:06.109'),
('f8436419-f49d-470f-a9c8-03d77064661b', 'b3fa3129-564d-4926-a813-3f343805c94e', '{{Matter.Title}}', 'Matter', 'title', 1, NULL, 'NONE', NULL, '2026-11-25 09:15:02.998', '2026-11-25 09:15:02.998'),
('f85935f8-94ce-4692-86d5-b6db9c29f0f2', 'f9b4e048-4705-4414-a181-411253453bf6', '{{MedicalProvider.Name}}', 'MedicalProvider', 'name', 0, NULL, 'NONE', NULL, '2026-11-25 09:23:20.542', '2026-11-25 09:23:20.542'),
('f86c3f5c-580a-45eb-a7a0-7787bf963e93', '55e6d123-74ea-443a-8bee-7a7913b1b687', '{{CurrentDate.Long}}', 'CurrentDate', 'long', 0, NULL, 'NONE', NULL, '2026-11-25 09:37:08.500', '2026-11-25 09:37:08.500'),
('f88537be-63c8-4ce8-8353-53ed1759ad28', 'f044998e-94c8-4a24-8776-9ffddfc146af', '{{Client.Name}}', 'Client', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:40:49.866', '2026-11-25 09:40:49.866'),
('f89e97bd-62d8-4278-8b6d-d07a71f02479', 'c2303872-a179-4c73-93f2-941c4abcbc6d', '{{Incident.AccidentDate}}', 'Incident', 'accidentDate', 0, NULL, 'DATE_LONG', NULL, '2026-11-25 09:24:55.871', '2026-11-25 09:24:55.871'),
('f8e5ded4-e03d-4e55-b4fa-af812437eae9', '3bbc2c93-4f93-48e7-828d-2a34553167e2', '{{Matter.MatterNumber}}', 'Matter', 'matterNumber', 1, NULL, 'NONE', NULL, '2026-11-25 09:16:01.257', '2026-11-25 09:16:01.257'),
('f9109b0b-82ae-4c6d-b14c-a00ddb359424', 'b851d494-c520-40cd-a7be-db993a2ea218', '{{Matter.Title}}', 'Matter', 'title', 1, NULL, 'NONE', NULL, '2026-11-25 09:07:16.221', '2026-11-25 09:07:16.221'),
('f93cac83-8e92-4f12-aef8-845b2fe822a8', '40b1c509-16ea-4fb3-b050-c2dc12af9afa', '{{Attorney.Name}}', 'ResponsibleAttorney', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:35:59.775', '2026-11-25 09:35:59.775'),
('f960bd68-3a8b-44a5-adc4-8b2a35a23705', 'eb02f6e2-eb95-476b-9f3a-0012c5e69de4', '{{Matter.Title}}', 'Matter', 'title', 1, NULL, 'NONE', NULL, '2026-11-25 09:37:55.738', '2026-11-25 09:37:55.738'),
('f9686c6b-35ed-4a26-9e51-7a2fffd0920a', '512ed74f-1f59-4a55-bbb2-348dc6dc277e', '{{CurrentDate.Long}}', 'CurrentDate', 'long', 0, NULL, 'NONE', NULL, '2026-11-25 09:22:59.548', '2026-11-25 09:22:59.548'),
('f9a6ef45-492c-4a5a-ac41-d7a39a8fe41e', '4189fd31-bd9b-4fce-ad0f-0e859a2cdb7d', '{{Insurance.CarrierName}}', 'Insurance', 'insuranceCompany', 0, NULL, 'NONE', NULL, '2026-11-25 09:10:10.077', '2026-11-25 09:10:10.077'),
('f9a82e44-42a5-4a44-8e52-29559647a40a', '87d1c498-8bb5-43b1-b07b-9b85ff412ce8', '{{Matter.MatterNumber}}', 'Matter', 'matterNumber', 1, NULL, 'NONE', NULL, '2026-11-25 09:33:01.955', '2026-11-25 09:33:01.955'),
('f9ef1a43-ad28-4797-921f-a6b6364c758e', '1268ae6d-8b19-4bfa-876e-155d51e429c9', '{{Matter.MatterNumber}}', 'Matter', 'matterNumber', 1, NULL, 'NONE', NULL, '2026-11-25 09:10:58.045', '2026-11-25 09:10:58.045'),
('fa0bc602-9d0e-4f9f-9ba9-100fb4d4b3ab', '58ec5cad-437f-4a3c-8985-2768faed1166', '{{Client.Name}}', 'Client', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:34:59.842', '2026-11-25 09:34:59.842'),
('fa3ff42d-2f59-427e-9534-4e662a93e717', '375fa418-f38e-4b87-91af-b4da814d3c41', '{{Matter.MatterNumber}}', 'Matter', 'matterNumber', 1, NULL, 'NONE', NULL, '2026-11-25 09:40:07.667', '2026-11-25 09:40:07.667'),
('fa5a691f-76c9-4a5a-8499-c1f4a98d73a4', '226f643a-3838-4870-ace9-92382b262487', '{{Client.Name}}', 'Client', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:16:13.582', '2026-11-25 09:16:13.582'),
('fa71781d-30fe-4342-a73c-a24d7eaa9ca8', '0e4344b0-09b4-4cdd-8f95-c257f94fdc79', '{{Matter.Title}}', 'Matter', 'title', 1, NULL, 'NONE', NULL, '2026-11-25 09:22:04.507', '2026-11-25 09:22:04.507'),
('fa7c6c68-2254-41b5-bb19-04c7237a2b28', 'bdbbe799-0966-4ffc-8c57-858e9721bb25', '{{Matter.MatterNumber}}', 'Matter', 'matterNumber', 1, NULL, 'NONE', NULL, '2026-11-25 09:14:22.018', '2026-11-25 09:14:22.018'),
('fa884157-72da-4bce-8b84-b4d9b9be2557', '17a56c0b-c6dd-4ffe-a43d-9606642e8ed3', '{{Client.Name}}', 'Client', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:23:31.235', '2026-11-25 09:23:31.235'),
('fb15aca2-d049-42ac-9c3b-da97e6864e11', 'd24a965c-788a-4dc5-93f8-b25f2bcc6604', '{{Matter.MatterNumber}}', 'Matter', 'matterNumber', 1, NULL, 'NONE', NULL, '2026-11-25 09:15:39.655', '2026-11-25 09:15:39.655'),
('fb229ffb-5888-4b33-b0f2-5bb0c02013eb', 'ab7e814b-ed5e-4402-8e4e-3c7f1fbae3e7', '{{Matter.Title}}', 'Matter', 'title', 1, NULL, 'NONE', NULL, '2026-11-25 09:41:44.613', '2026-11-25 09:41:44.613'),
('fb2db785-e49a-43dc-b9bb-7a93ee1691ad', '228a46fa-e493-4eed-8057-2350df11cfba', 'Matter.MatterNumber', 'Matter', 'matterNumber', 1, NULL, 'NONE', NULL, '2026-11-14 09:29:49.029', '2026-11-14 09:29:49.029'),
('fb539337-1a32-4bc1-bfa8-e65920d5e59c', '3e0af65d-626c-4468-8b9b-6b10b044165b', '{{Matter.MatterNumber}}', 'Matter', 'matterNumber', 1, NULL, 'NONE', NULL, '2026-11-25 09:16:39.847', '2026-11-25 09:16:39.847'),
('fbc41315-5246-4169-b4b6-ed462069169f', '337aeffc-4ece-4ce7-82a5-d6b928eefac4', '{{Matter.MatterNumber}}', 'Matter', 'matterNumber', 1, NULL, 'NONE', NULL, '2026-11-25 09:09:02.748', '2026-11-25 09:09:02.748'),
('fbfc9fb8-27c3-4614-9c9f-87bee5649cdd', 'c968ff58-b7bc-4390-a9ce-e07e8f62d618', '{{Matter.Title}}', 'Matter', 'title', 1, NULL, 'NONE', NULL, '2026-11-25 09:28:41.155', '2026-11-25 09:28:41.155'),
('fca6b076-ba05-4f65-ba27-c5f6449839bd', '9692a5aa-2e76-4c88-bb31-9f2573946b83', '{{Attorney.Name}}', 'ResponsibleAttorney', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:09:30.940', '2026-11-25 09:09:30.940'),
('fcb49321-d5ae-4c8d-b4ea-aaafc3ec567c', 'bd5f9e2c-a31a-47ab-98fa-b2098f51e5dd', '{{Matter.Title}}', 'Matter', 'title', 1, NULL, 'NONE', NULL, '2026-11-25 09:35:14.725', '2026-11-25 09:35:14.725'),
('fcb5e31d-b503-4ecd-b5df-e76ef0d9f46e', '8a427a6e-d37a-4951-8cd6-24e4ed518b16', '{{Client.Name}}', 'Client', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:29:00.511', '2026-11-25 09:29:00.511'),
('fcca2c49-6351-4e94-8ea5-31b2535d704b', '23bb7516-3519-4d23-ba71-d470de1605e0', '{{Matter.MatterNumber}}', 'Matter', 'matterNumber', 1, NULL, 'NONE', NULL, '2026-11-25 09:42:15.911', '2026-11-25 09:42:15.911'),
('fd0d4112-722a-448b-a532-962d41e18902', 'cf3f8036-b51a-4805-9815-f7e0ab87f802', '{{Matter.MatterNumber}}', 'Matter', 'matterNumber', 1, NULL, 'NONE', NULL, '2026-11-25 09:25:10.406', '2026-11-25 09:25:10.406'),
('fda4fb94-a0ea-4f9d-b343-2ad1d4e61826', '8eaaf587-a871-4b9d-ba8a-54e4e38e7234', '{{Attorney.Name}}', 'ResponsibleAttorney', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:41:15.701', '2026-11-25 09:41:15.701'),
('fe8a273d-bcd7-4997-9a09-f255ae463a68', '7e69c06a-139d-48d6-af7c-bbbc8ff7cf3f', '{{Matter.MatterNumber}}', 'Matter', 'matterNumber', 1, NULL, 'NONE', NULL, '2026-11-25 09:45:17.740', '2026-11-25 09:45:17.740'),
('ff090698-da89-4d51-aa28-920759d9f4f1', 'c5ce2bf6-f9cf-464a-b12a-e34c4d9749cc', '{{Attorney.Name}}', 'ResponsibleAttorney', 'name', 1, NULL, 'NONE', NULL, '2026-11-25 09:28:17.723', '2026-11-25 09:28:17.723'),
('ff817124-66b6-4b51-b0f7-961ab38e4798', 'b3795800-cd6e-4e96-84d4-f31e28eaab0f', '{{Matter.MatterNumber}}', 'Matter', 'matterNumber', 1, NULL, 'NONE', NULL, '2026-11-25 09:27:22.513', '2026-11-25 09:27:22.513'),
('ffd53f07-f42b-4c3a-a390-28aee2eaec42', 'f044998e-94c8-4a24-8776-9ffddfc146af', '{{Matter.MatterNumber}}', 'Matter', 'matterNumber', 1, NULL, 'NONE', NULL, '2026-11-25 09:40:49.866', '2026-11-25 09:40:49.866'),
('fff4e86a-5ec5-404f-9030-0ee878807e13', '689ca019-7b8a-40f6-8175-1c027a48a5cd', '{{Matter.MatterNumber}}', 'Matter', 'matterNumber', 1, NULL, 'NONE', NULL, '2026-11-25 09:32:26.150', '2026-11-25 09:32:26.150');

-- --------------------------------------------------------

--
-- Table structure for table `document_templates`
--

CREATE TABLE `document_templates` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `template_code` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `template_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `practice_area_id` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `category` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `output_format` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'DOCX',
  `current_version` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'v1.0',
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `is_system_default` tinyint(1) NOT NULL DEFAULT '0',
  `created_by_user_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `document_templates`
--

INSERT INTO `document_templates` (`id`, `template_code`, `template_name`, `description`, `practice_area_id`, `category`, `output_format`, `current_version`, `is_active`, `is_system_default`, `created_by_user_id`, `created_at`, `updated_at`) VALUES
('0093dc0f-9885-4ab2-bc65-260cbe94e516', 'CAT-021', 'Draft invoice (CAT-021)', 'Trigger: Approved work enters billing run | Fields: Time, rates, expenses, adjustments, fee arrangement', 'pa-civ', 'Engagement', 'BOTH', 'v1.0', 1, 1, '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:10:19.043', '2026-11-25 09:10:19.043'),
('015f67c2-e6b2-47fc-b822-9c079485d41b', 'CAT-087', 'Proposed order (CAT-087)', 'Trigger: Proposed relief approved | Fields: Motion, requested ruling, obligations, dates', 'pa-civ', 'Civil Litigation', 'BOTH', 'v1.0', 1, 0, '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:19:11.121', '2026-11-25 09:19:11.121'),
('01ae7515-b7ce-4564-a90b-f218fad041dd', 'CAT-168', 'Statement of financial affairs draft (CAT-168)', 'Trigger: Financial history reviewed | Fields: Income history, payments, transfers, lawsuits, business facts', 'pa-bk', 'Bankruptcy', 'BOTH', 'v1.0', 1, 0, '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:29:08.687', '2026-11-25 09:29:08.687'),
('0306f395-2238-4ea1-9c09-9a6d1e55cfb3', 'CAT-136', 'Client settlement authority request (CAT-136)', 'Trigger: Attorney proposes settlement position | Fields: Offer, terms, deductions, projected net, decision requested', 'pa-pi', 'Personal Injury', 'BOTH', 'v1.0', 1, 0, '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:25:34.746', '2026-11-25 09:25:34.746'),
('03c12606-60df-4522-9ce8-798b0751f27e', 'CAT-300', 'Eviction judgment payment and closure letter (CAT-300)', 'Trigger: Judgment or settlement closure reviewed | Fields: Possession outcome, amounts, payments, satisfaction, remaining tasks', 'pa-evict', 'Landlord-Tenant', 'BOTH', 'v1.0', 1, 0, '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:45:35.888', '2026-11-25 09:45:35.888'),
('04fb4136-c063-4dd9-9e36-24689fe2c58c', 'CAT-202', 'Official Form I 129 draft (CAT-202)', 'Trigger: Nonimmigrant worker petition selected | Fields: Petitioner, beneficiary, employment, supplement, current edition', 'pa-imm', 'Immigration', 'BOTH', 'v1.0', 1, 0, '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:33:57.709', '2026-11-25 09:33:57.709'),
('0577005e-4015-46f4-a839-81d4707c8da0', 'CAT-264', 'Motion to enforce family order (CAT-264)', 'Trigger: Enforcement action authorized | Fields: Order provisions, violations, evidence, requested remedies', 'pa-fam', 'Family Law', 'BOTH', 'v1.0', 1, 0, '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:41:09.163', '2026-11-25 09:41:09.163'),
('05dd346b-aa51-4409-98ad-573bf92e199f', 'CAT-007', 'Conflict disclosure and proposed consent (CAT-007)', 'Trigger: Attorney authorizes disclosure | Fields: Conflict facts, affected clients, approved disclosure language', 'pa-civ', 'Engagement', 'BOTH', 'v1.0', 1, 1, '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:07:54.843', '2026-11-25 09:07:54.843'),
('06db1160-b526-47f4-b345-d58a6847e9c5', 'CAT-025', 'Retainer replenishment request (CAT-025)', 'Trigger: Configured available balance threshold reached | Fields: Current funds, requested amount, terms, payment route', 'pa-civ', 'Engagement', 'BOTH', 'v1.0', 1, 1, '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:10:58.045', '2026-11-25 09:10:58.045'),
('0820e407-4b30-4921-bccf-282400263ca9', 'CAT-010', 'Welcome letter and next steps (CAT-010)', 'Trigger: Matter opened | Fields: Team, contact methods, questionnaire, initial tasks', 'pa-civ', 'Engagement', 'BOTH', 'v1.0', 1, 1, '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:08:19.002', '2026-11-25 09:08:19.002'),
('08cdaf0b-6dde-4b6a-82ff-7f7b00172ddd', 'CAT-119', 'Medical retrieval vendor assignment letter (CAT-119)', 'Trigger: Retrieval assignment approved | Fields: Providers, authorizations, dates, selected records, delivery', 'pa-pi', 'Personal Injury', 'BOTH', 'v1.0', 1, 0, '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:23:37.028', '2026-11-25 09:23:37.028'),
('09379ca7-72a7-4fd4-9a16-4adf5b6a8038', 'CAT-107', 'Crash scene and camera preservation demand (CAT-107)', 'Trigger: Camera or scene evidence identified | Fields: Custodian, location, date and time range, evidence type', 'pa-pi', 'Personal Injury', 'BOTH', 'v1.0', 1, 0, '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:22:04.507', '2026-11-25 09:22:04.507'),
('09bca63a-1776-4d61-8285-1039767c58c5', 'CAT-271', 'Criminal investigation and witness instruction packet (CAT-271)', 'Trigger: Investigation assigned | Fields: Witnesses, disputed facts, evidence, scope, restrictions', 'pa-crim', 'Criminal Defense', 'BOTH', 'v1.0', 1, 0, '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:42:01.887', '2026-11-25 09:42:01.887'),
('09c6585a-8b08-423e-95e2-96304290553a', 'CAT-116', 'Incomplete medical records follow-up (CAT-116)', 'Trigger: Received packet marked incomplete | Fields: Original request, missing components, dates, recipient', 'pa-pi', 'Personal Injury', 'BOTH', 'v1.0', 1, 0, '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:23:14.204', '2026-11-25 09:23:14.204'),
('0a44de2e-b22f-4253-9d4c-9b58cdd69fa8', 'CAT-234', 'Claim allowance or objection notice (CAT-234)', 'Trigger: Claim disposition authorized | Fields: Claim, approved determination, recipient, procedure and dates', 'pa-prob', 'Probate', 'BOTH', 'v1.0', 1, 0, '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:37:40.653', '2026-11-25 09:37:40.653'),
('0b8d82cd-2388-48a4-b33e-06b6e3005b45', 'CAT-166', 'Schedule I income draft (CAT-166)', 'Trigger: Income verification completed | Fields: Employment, household income, deductions, other receipts', 'pa-bk', 'Bankruptcy', 'BOTH', 'v1.0', 1, 0, '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:28:53.764', '2026-11-25 09:28:53.764'),
('0c1ceff7-afe7-488a-af33-42ff9cb4e6d0', 'CAT-197', 'Official Form I 485 draft (CAT-197)', 'Trigger: Adjustment preparation selected | Fields: Applicant, eligibility path, history, approved answers, current edition', 'pa-imm', 'Immigration', 'BOTH', 'v1.0', 1, 0, '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:33:15.311', '2026-11-25 09:33:15.311'),
('0d7bee95-ad77-4bb4-be91-0e1ae9c0e5cf', 'CAT-072', 'Meet and confer letter (CAT-072)', 'Trigger: Conference effort initiated | Fields: Dispute, prior efforts, proposed agenda, availability', 'pa-civ', 'Civil Litigation', 'BOTH', 'v1.0', 1, 0, '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:17:25.046', '2026-11-25 09:17:25.046'),
('0d95d5b9-1a34-4fe7-b6be-2a42cea0f2c5', 'CAT-035', 'Evidence collection instructions (CAT-035)', 'Trigger: Collection task assigned | Fields: Custodian, source, format, permissions, chain of custody', 'pa-civ', 'Civil Litigation', 'BOTH', 'v1.0', 1, 0, '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:12:29.314', '2026-11-25 09:12:29.314'),
('0dc971e8-a869-4e03-9104-11ca9932bd55', 'CAT-289', 'Rehearing or certiorari petition draft (CAT-289)', 'Trigger: Further review authorized | Fields: Decision, issues, preservation, reviewed grounds, record', 'pa-app', 'Appeals', 'BOTH', 'v1.0', 1, 0, '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:44:21.971', '2026-11-25 09:44:21.971'),
('10204514-84d5-4924-8542-7e24f6143d29', 'CAT-250', 'Financial declaration draft (CAT-250)', 'Trigger: Financial records verified | Fields: Income, expenses, assets, debts, supporting documents', 'pa-fam', 'Family Law', 'BOTH', 'v1.0', 1, 0, '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:39:35.618', '2026-11-25 09:39:35.618'),
('1040b9f8-811f-4b1f-8747-3bb996592e8a', 'CAT-051', 'Amended answer and defenses (CAT-051)', 'Trigger: Response amendment authorized | Fields: New positions, amendment authority, operative pleading', 'pa-civ', 'Civil Litigation', 'BOTH', 'v1.0', 1, 0, '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:14:52.736', '2026-11-25 09:14:52.736'),
('1068bc35-2cca-4a25-aee4-9d12976a2155', 'CAT-178', 'Amended bankruptcy schedule packet (CAT-178)', 'Trigger: Amendment authorized | Fields: Changed records, affected schedules, notices, signatures', 'pa-bk', 'Bankruptcy', 'BOTH', 'v1.0', 1, 0, '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:30:35.622', '2026-11-25 09:30:35.622'),
('12c33d8f-b9e5-4764-aeee-1d38ac17a637', 'CAT-100', 'Client accident statement questionnaire (CAT-100)', 'Trigger: PI matter opened | Fields: Incident subtype, participants, location, injuries, evidence prompts', 'pa-pi', 'Personal Injury', 'BOTH', 'v1.0', 1, 0, '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:21:03.947', '2026-11-25 09:21:03.947'),
('14a16855-4d02-4590-904d-ccd58a36d35e', 'CAT-074', 'Motion to compel (CAT-074)', 'Trigger: Compulsion request authorized | Fields: Requests, service, deficiencies, efforts, exhibits, relief', 'pa-civ', 'Civil Litigation', 'BOTH', 'v1.0', 1, 0, '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:17:41.650', '2026-11-25 09:17:41.650'),
('1516c541-358e-4fc7-b44a-9ac7148aeafb', 'CAT-169', 'Statement of intention draft (CAT-169)', 'Trigger: Secured asset treatment selected | Fields: Property, creditors, attorney selected treatment, official edition', 'pa-bk', 'Bankruptcy', 'BOTH', 'v1.0', 1, 0, '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:29:16.116', '2026-11-25 09:29:16.116'),
('15836596-59b3-4de3-a112-20a5158c2b99', 'CAT-182', 'Reaffirmation review memorandum (CAT-182)', 'Trigger: Reaffirmation proposal received | Fields: Debt, collateral, budget, terms, attorney analysis fields', 'pa-bk', 'Bankruptcy', 'BOTH', 'v1.0', 1, 0, '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:31:06.958', '2026-11-25 09:31:06.958'),
('16211e5c-a798-431d-8540-e97cc280996e', 'CAT-113', 'Medical records request (CAT-113)', 'Trigger: Provider and authorization available | Fields: Client, provider, service dates, requested components, delivery', 'pa-pi', 'Personal Injury', 'BOTH', 'v1.0', 1, 0, '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:22:53.102', '2026-11-25 09:22:53.102'),
('1725a3fd-9703-4f40-ad03-7dd5bbf4a47e', 'CAT-114', 'Itemized medical bill request (CAT-114)', 'Trigger: Billing records collection activated | Fields: Patient, account, provider, service dates, billing detail', 'pa-pi', 'Personal Injury', 'BOTH', 'v1.0', 1, 0, '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:22:59.548', '2026-11-25 09:22:59.548'),
('17cfe3a9-5582-4877-8bec-2e405d08253b', 'CAT-127', 'Future care information request (CAT-127)', 'Trigger: Future treatment evidence needed | Fields: Provider, prognosis questions, recommendations, cost support', 'pa-pi', 'Personal Injury', 'BOTH', 'v1.0', 1, 0, '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:24:30.718', '2026-11-25 09:24:30.718'),
('1a66b1f9-e5f1-4138-9852-9f45bc2741c3', 'CAT-292', 'Rent and charge ledger statement (CAT-292)', 'Trigger: Account evidence verified | Fields: Charges, payments, credits, deposits, disputed items, dates', 'pa-evict', 'Landlord-Tenant', 'BOTH', 'v1.0', 1, 0, '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:44:42.548', '2026-11-25 09:44:42.548'),
('1bb31b5d-a533-469a-84ef-1ba71a09b612', 'CAT-079', 'Organizational deposition topics notice (CAT-079)', 'Trigger: Organizational deposition authorized | Fields: Entity, topics, scope, event details', 'pa-civ', 'Civil Litigation', 'BOTH', 'v1.0', 1, 0, '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:18:14.290', '2026-11-25 09:18:14.290'),
('1cbdc2c6-906f-4b3f-ab9b-01d43376149b', 'CAT-290', 'Mandate remand and client outcome instructions (CAT-290)', 'Trigger: Disposition or mandate reviewed | Fields: Decision, remand duties, related matter, remaining actions', 'pa-app', 'Appeals', 'BOTH', 'v1.0', 1, 0, '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:44:28.526', '2026-11-25 09:44:28.526'),
('1d9232ac-e585-4692-9519-e5de662b722b', 'CAT-088', 'Hearing preparation memorandum (CAT-088)', 'Trigger: Hearing preparation begins | Fields: Issues, briefs, authorities, exhibits, requested rulings', 'pa-civ', 'Civil Litigation', 'BOTH', 'v1.0', 1, 0, '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:19:21.787', '2026-11-25 09:19:21.787'),
('1dc2a79c-772d-4565-a4c1-2c45fda093e1', 'CAT-270', 'Missing criminal discovery request (CAT-270)', 'Trigger: Discovery deficiency reviewed | Fields: Reports, recordings, tests, prior requests, missing items', 'pa-crim', 'Criminal Defense', 'BOTH', 'v1.0', 1, 0, '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:41:49.879', '2026-11-25 09:41:49.879'),
('1ecad20e-6893-4866-98fc-bf6d74a3f328', 'CAT-105', 'Police or incident report request (CAT-105)', 'Trigger: Investigating agency identified | Fields: Incident, agency, report number, client, authorization', 'pa-pi', 'Personal Injury', 'BOTH', 'v1.0', 1, 0, '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:21:48.687', '2026-11-25 09:21:48.687'),
('1fc76c4c-232d-4040-8e65-6a07ac50113a', 'CAT-038', 'Prefiling demand letter (CAT-038)', 'Trigger: Demand strategy authorized | Fields: Claims, supporting facts, relief, recipient, response date', 'pa-civ', 'Civil Litigation', 'BOTH', 'v1.0', 1, 0, '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:12:56.213', '2026-11-25 09:12:56.213'),
('216964a4-ec01-46f9-9661-7dd8a2d5066b', 'CAT-198', 'Official Form I 765 draft (CAT-198)', 'Trigger: Work authorization preparation selected | Fields: Applicant, category, status, history, verified edition', 'pa-imm', 'Immigration', 'BOTH', 'v1.0', 1, 0, '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:33:24.062', '2026-11-25 09:33:24.062'),
('25a838af-09c3-464f-8d09-4e2d365e57ae', 'CAT-268', 'Release condition review memorandum (CAT-268)', 'Trigger: Release order reviewed | Fields: Conditions, custody, client concerns, source order', 'pa-crim', 'Criminal Defense', 'BOTH', 'v1.0', 1, 0, '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:41:39.010', '2026-11-25 09:41:39.010'),
('26c5b56f-735a-46f6-a451-5d62f8943029', 'CAT-103', 'Policy document and endorsement request (CAT-103)', 'Trigger: Policy information incomplete | Fields: Carrier, policy period, insured, requested endorsements', 'pa-pi', 'Personal Injury', 'BOTH', 'v1.0', 1, 0, '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:21:31.807', '2026-11-25 09:21:31.807'),
('278b93ff-c452-4e2e-b5f2-7f91bccc83ac', 'CAT-003', 'Conflict search report (CAT-003)', 'Trigger: Conflict search completed | Fields: Search terms, related parties, matches, reviewer', 'pa-civ', 'Engagement', 'BOTH', 'v1.0', 1, 1, '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:07:05.165', '2026-11-25 09:07:05.165'),
('27a2e416-243b-41df-bd83-7ca8ca9b4bb2', 'CAT-295', 'Eviction complaint and filing packet (CAT-295)', 'Trigger: Filing prerequisites reviewed and action authorized | Fields: Lease, notices, service, ledger, possession and monetary relief', 'pa-evict', 'Landlord-Tenant', 'BOTH', 'v1.0', 1, 0, '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:45:03.790', '2026-11-25 09:45:03.790'),
('283a2dd2-2e77-4466-9919-dc0a1eb6226e', '001', 'Master Client Engagement & Retainer Agreement (Template 001)', 'Standard attorney representation agreement and legal retainer agreement under Utah RPC 1.5 & 1.15.', 'pa-fam', 'Engagement', 'DOCX', 'v1.0', 1, 1, '1a1c1f3c-1a81-47aa-bad3-ec5fd76b9730', '2026-11-14 09:29:59.262', '2026-11-14 09:29:59.262'),
('2a36dbf5-47ec-4300-b2d3-90dfabe8b618', 'CAT-161', 'Schedule C exemption draft (CAT-161)', 'Trigger: Attorney selects exemptions | Fields: Assets, claimed exemptions, amounts, approved legal basis', 'pa-bk', 'Bankruptcy', 'BOTH', 'v1.0', 1, 0, '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:28:22.849', '2026-11-25 09:28:22.849'),
('2d18751d-7e43-4152-92b0-4bcbc42f2e14', 'CAT-001', 'Consultation confirmation (CAT-001)', 'Trigger: Consultation booked | Fields: Contact, date, location, attorney, preparation instructions', 'pa-civ', 'Engagement', 'BOTH', 'v1.0', 1, 1, '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:06:41.631', '2026-11-25 09:06:41.631'),
('2db483ac-126c-4cba-98d5-5d85e5dcc17b', 'CAT-206', 'Official Form N 400 draft (CAT-206)', 'Trigger: Naturalization preparation selected | Fields: Applicant, eligibility inputs, history, approved answers, edition', 'pa-imm', 'Immigration', 'BOTH', 'v1.0', 1, 0, '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:34:22.712', '2026-11-25 09:34:22.712'),
('2e5d6f2a-48fb-4ca7-866d-a98f0ab02ce2', 'CAT-153', 'Debtor identity and household worksheet (CAT-153)', 'Trigger: Identity intake saved | Fields: Debtors, dependents, residence, household, source verification', 'pa-bk', 'Bankruptcy', 'BOTH', 'v1.0', 1, 0, '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:27:34.610', '2026-11-25 09:27:34.610'),
('2e7970f7-243b-4c11-bbe4-136d31708525', 'CAT-027', 'Client trust ledger statement (CAT-027)', 'Trigger: Authorized statement event | Fields: Client allocations, receipts, disbursements, running balance', 'pa-civ', 'Engagement', 'BOTH', 'v1.0', 1, 1, '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:11:16.455', '2026-11-25 09:11:16.455'),
('31691f0e-386c-4e43-a124-80b35792c9ab', 'CAT-266', 'Criminal defense intake questionnaire (CAT-266)', 'Trigger: Criminal matter opened | Fields: Defendant, charges, custody, events, restrictions, related cases', 'pa-crim', 'Criminal Defense', 'BOTH', 'v1.0', 1, 0, '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:41:23.875', '2026-11-25 09:41:23.875'),
('31ad4e4e-c275-400f-9fb2-525090e88ac5', 'CAT-241', 'Trust asset funding and title checklist (CAT-241)', 'Trigger: Trust asset review initiated | Fields: Assets, current title, intended ownership, transfer evidence', 'pa-prob', 'Probate', 'BOTH', 'v1.0', 1, 0, '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:38:28.453', '2026-11-25 09:38:28.453'),
('32585473-cefb-450b-b074-ec44436acc3e', 'CAT-047', 'Counterclaim (CAT-047)', 'Trigger: Counterclaim authorized | Fields: Parties, claims, facts, relief, related allegations', 'pa-civ', 'Civil Litigation', 'BOTH', 'v1.0', 1, 0, '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:14:22.018', '2026-11-25 09:14:22.018'),
('32aba23d-c372-40be-bfd3-cc5314edbbfb', 'CAT-261', 'Retirement division instruction letter (CAT-261)', 'Trigger: Retirement division task opened | Fields: Plan, participant, award, decree, specialist, required information', 'pa-fam', 'Family Law', 'BOTH', 'v1.0', 1, 0, '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:40:49.866', '2026-11-25 09:40:49.866'),
('34081a3e-beca-4f7d-9bd7-e3245f37386b', 'CAT-187', 'Petitioner information questionnaire (CAT-187)', 'Trigger: Petitioner linked | Fields: Identity, status, addresses, relationships, supporting records', 'pa-imm', 'Immigration', 'BOTH', 'v1.0', 1, 0, '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:31:52.621', '2026-11-25 09:31:52.621'),
('34ad861c-3bf0-44fe-926f-a59f4942dc93', 'CAT-217', 'Request for evidence response packet (CAT-217)', 'Trigger: Notice reviewed and response authorized | Fields: Notice requests, approved evidence, response narrative, index', 'pa-imm', 'Immigration', 'BOTH', 'v1.0', 1, 0, '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:35:44.995', '2026-11-25 09:35:44.995'),
('35b83139-553c-45d2-a796-cb9faa2b9502', 'CAT-037', 'Witness interview memorandum (CAT-037)', 'Trigger: Interview record submitted | Fields: Notes, source recording, verified facts, follow-up', 'pa-civ', 'Civil Litigation', 'BOTH', 'v1.0', 1, 0, '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:12:48.006', '2026-11-25 09:12:48.006'),
('35f0da8a-1625-49cd-b5f4-3e7abf855f47', 'CAT-004', 'Engagement letter and fee agreement (CAT-004)', 'Trigger: Engagement terms selected | Fields: Clients, scope, exclusions, rates, responsible attorney', 'pa-civ', 'Engagement', 'BOTH', 'v1.0', 1, 1, '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:07:16.221', '2026-11-25 09:07:16.221'),
('37733493-a999-4cb4-9bb9-83b79a6dc4ee', 'CAT-294', 'Notice service instructions and proof worksheet (CAT-294)', 'Trigger: Notice service task opened | Fields: Notice version, recipients, locations, method, service evidence', 'pa-evict', 'Landlord-Tenant', 'BOTH', 'v1.0', 1, 0, '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:44:55.857', '2026-11-25 09:44:55.857'),
('39dd4289-ce9f-4c2b-9ef7-c70fe8375c93', 'CAT-207', 'Official Form I 589 draft (CAT-207)', 'Trigger: Asylum preparation authorized | Fields: Applicant, dependents, history, reviewed narrative, current edition', 'pa-imm', 'Immigration', 'BOTH', 'v1.0', 1, 0, '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:34:29.597', '2026-11-25 09:34:29.597'),
('39e0fa08-147f-4465-9b81-f6d7bcf5d486', 'CAT-045', 'Service status and attempt report (CAT-045)', 'Trigger: Service attempt recorded | Fields: Party, attempt, method, result, supporting evidence', 'pa-civ', 'Civil Litigation', 'BOTH', 'v1.0', 1, 0, '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:14:03.120', '2026-11-25 09:14:03.120'),
('3afb4bc6-0545-496f-be31-a08e930cfb54', 'CAT-014', 'Appointment and hearing preparation letter (CAT-014)', 'Trigger: Client attendance event confirmed | Fields: Event, place, attendance method, required preparation', 'pa-civ', 'Engagement', 'BOTH', 'v1.0', 1, 1, '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:09:02.748', '2026-11-25 09:09:02.748'),
('3c4e2cf6-be4c-40d1-a9f2-b45873a3957d', 'CAT-299', 'Possession enforcement instruction packet (CAT-299)', 'Trigger: Enforcement authorized on reviewed order | Fields: Order, authorized official, property, conditions, coordination', 'pa-evict', 'Landlord-Tenant', 'BOTH', 'v1.0', 1, 0, '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:45:28.746', '2026-11-25 09:45:28.746'),
('3c6f78d4-9bf3-4ea4-bdf4-397fdc4133b7', 'CAT-282', 'Notice of appeal or cross appeal (CAT-282)', 'Trigger: Appeal filing authorized | Fields: Parties, order, court, case, representation, required attachments', 'pa-app', 'Appeals', 'BOTH', 'v1.0', 1, 0, '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:43:26.986', '2026-11-25 09:43:26.986'),
('3da83698-9663-4a10-9faa-1edaf742b1bd', 'CAT-131', 'Settlement demand narrative (CAT-131)', 'Trigger: Demand preparation activated | Fields: Liability facts, treatment, damages, source records, approved analysis', 'pa-pi', 'Personal Injury', 'BOTH', 'v1.0', 1, 0, '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:25:03.045', '2026-11-25 09:25:03.045'),
('411f1e96-3b18-4d1b-9c9b-c7fca1276281', 'CAT-102', 'Insurance coverage and limits request (CAT-102)', 'Trigger: Coverage investigation activated | Fields: Insured, claimant, policy, incident, requested documents', 'pa-pi', 'Personal Injury', 'BOTH', 'v1.0', 1, 0, '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:21:23.822', '2026-11-25 09:21:23.822'),
('41dae77a-815f-4e06-949f-c20fbf08f52d', 'CAT-139', 'Lien reduction proposal (CAT-139)', 'Trigger: Lien negotiation authorized | Fields: Asserted and verified amounts, recovery, proposed payoff, grounds', 'pa-pi', 'Personal Injury', 'BOTH', 'v1.0', 1, 0, '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:25:52.825', '2026-11-25 09:25:52.825'),
('430122fc-1db7-4fa7-98f6-1234d54b7b77', 'CAT-013', 'Client status report (CAT-013)', 'Trigger: Reporting interval reached | Fields: Approved milestones, upcoming work, outstanding requests', 'pa-civ', 'Engagement', 'BOTH', 'v1.0', 1, 1, '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:08:48.958', '2026-11-25 09:08:48.958'),
('431c09bd-90ad-4beb-9543-21428759b8b8', 'CAT-192', 'Immigration identity and relationship summary (CAT-192)', 'Trigger: Participant data verified | Fields: Names, aliases, family links, identity documents, sources', 'pa-imm', 'Immigration', 'BOTH', 'v1.0', 1, 0, '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:32:36.184', '2026-11-25 09:32:36.184'),
('4359ffc0-4a06-4c98-bc56-45af58101b3c', 'CAT-226', 'Proposed fiduciary appointment order (CAT-226)', 'Trigger: Appointment relief approved | Fields: Petition, fiduciary, requested authority, court requirements', 'pa-prob', 'Probate', 'BOTH', 'v1.0', 1, 0, '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:36:49.099', '2026-11-25 09:36:49.099'),
('43d8d6ce-4a93-45ea-9ee1-6f23d6079fd9', 'CAT-230', 'Asset valuation request letter (CAT-230)', 'Trigger: Valuation task assigned | Fields: Property, valuation date, appraiser, requested scope', 'pa-prob', 'Probate', 'BOTH', 'v1.0', 1, 0, '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:37:15.408', '2026-11-25 09:37:15.408'),
('44cd4125-ce90-4d76-9fc6-0a77398ad1d5', 'CAT-209', 'Official Form I 360 draft (CAT-209)', 'Trigger: Applicable special immigrant path selected | Fields: Selected category, petitioner, beneficiary, required evidence', 'pa-imm', 'Immigration', 'BOTH', 'v1.0', 1, 0, '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:34:41.992', '2026-11-25 09:34:41.992'),
('451b5eb2-f1be-40d9-9d84-fc5b634af9b6', 'CAT-179', 'Meeting of creditors preparation letter (CAT-179)', 'Trigger: Meeting notice entered and reviewed | Fields: Debtor, meeting details, required preparation, records', 'pa-bk', 'Bankruptcy', 'BOTH', 'v1.0', 1, 0, '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:30:44.324', '2026-11-25 09:30:44.324'),
('46048326-0cd1-46ed-bba8-4d2b5e611987', 'CAT-123', 'Medical treatment chronology (CAT-123)', 'Trigger: Approved treatment data received or changed | Fields: Providers, service dates, diagnoses, procedures, source pages', 'pa-pi', 'Personal Injury', 'BOTH', 'v1.0', 1, 0, '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:24:04.682', '2026-11-25 09:24:04.682'),
('463ac23f-2bdb-4f83-90c3-f7ed9b149ac2', 'CAT-180', 'Trustee document production cover letter (CAT-180)', 'Trigger: Trustee production approved | Fields: Request, selected documents, dates, exclusions, delivery', 'pa-bk', 'Bankruptcy', 'BOTH', 'v1.0', 1, 0, '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:30:52.249', '2026-11-25 09:30:52.249'),
('46582f64-d35c-4f14-b04b-9dd04a3bae31', 'CAT-218', 'Interview preparation letter and checklist (CAT-218)', 'Trigger: Interview notice reviewed | Fields: Participant, location, date, case issues, documents', 'pa-imm', 'Immigration', 'BOTH', 'v1.0', 1, 0, '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:35:52.189', '2026-11-25 09:35:52.189'),
('475b248a-1af7-4da6-91c2-1604c5d82051', 'CAT-118', 'Medical request rejection response (CAT-118)', 'Trigger: Rejection reason entered | Fields: Provider response, defect, corrected information, attachments', 'pa-pi', 'Personal Injury', 'BOTH', 'v1.0', 1, 0, '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:23:31.235', '2026-11-25 09:23:31.235'),
('47a69abb-1d3b-4d63-998b-49a7a632aa69', '112', 'HIPAA Medical Information Authorization (Template 112)', 'HIPAA and Utah state law-compliant authorization for release of protected health information.', 'pa-pi', 'Authorizations', 'DOCX', 'v1.0', 0, 1, '1a1c1f3c-1a81-47aa-bad3-ec5fd76b9730', '2026-11-14 09:29:49.029', '2026-11-25 09:08:04.762'),
('491f1a6f-0f0d-446e-9d06-4806cc2fa2b0', 'CAT-048', 'Crossclaim (CAT-048)', 'Trigger: Crossclaim authorized | Fields: Coparties, claim basis, facts, requested relief', 'pa-civ', 'Civil Litigation', 'BOTH', 'v1.0', 1, 0, '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:14:29.395', '2026-11-25 09:14:29.395'),
('49979158-6865-42dd-a937-db4f2f20a3a7', 'CAT-220', 'Immigration outcome and next steps letter (CAT-220)', 'Trigger: Decision reviewed | Fields: Decision, validity, conditions, remaining actions, client instructions', 'pa-imm', 'Immigration', 'BOTH', 'v1.0', 1, 0, '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:36:07.075', '2026-11-25 09:36:07.075'),
('4a78e072-441a-4bea-9184-099efeff86f7', 'CAT-146', 'Lien payment cover letter and receipt request (CAT-146)', 'Trigger: Approved lien payment confirmed | Fields: Payee, amount, claim, payment reference, release request', 'pa-pi', 'Personal Injury', 'BOTH', 'v1.0', 1, 0, '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:26:44.761', '2026-11-25 09:26:44.761'),
('4a79e9bc-b7a0-4f9a-9684-534d9067b04b', 'CAT-036', 'Witness interview questionnaire (CAT-036)', 'Trigger: Witness added | Fields: Witness role, issues, chronology, interview plan', 'pa-civ', 'Civil Litigation', 'BOTH', 'v1.0', 1, 0, '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:12:38.790', '2026-11-25 09:12:38.790'),
('4bedb78e-e248-4d99-a381-bf12c6a9fc33', 'CAT-091', 'Trial brief and issues statement (CAT-091)', 'Trigger: Trial preparation activated | Fields: Claims, disputed issues, authorities, proof, relief', 'pa-civ', 'Civil Litigation', 'BOTH', 'v1.0', 1, 0, '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:19:52.633', '2026-11-25 09:19:52.633'),
('4c3d4e11-98b3-4da8-a203-05acf891183b', 'CAT-108', 'Vehicle inspection and evidence preservation letter (CAT-108)', 'Trigger: Vehicle evidence workflow activated | Fields: Vehicle, owner, location, incident, inspection request', 'pa-pi', 'Personal Injury', 'BOTH', 'v1.0', 1, 0, '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:22:11.842', '2026-11-25 09:22:11.842'),
('4ce12433-32c5-4583-a496-401178fa26aa', 'CAT-071', 'Discovery deficiency letter (CAT-071)', 'Trigger: Deficiencies approved | Fields: Requests, missing responses, missing records, proposed cure', 'pa-civ', 'Civil Litigation', 'BOTH', 'v1.0', 1, 0, '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:17:16.922', '2026-11-25 09:17:16.922'),
('4d1e027a-1ae2-4c89-8ca2-d31042a2ec7c', 'CAT-194', 'Official Form G 28 draft (CAT-194)', 'Trigger: Representation package opened | Fields: Client, attorney, case type, authorized scope, current edition', 'pa-imm', 'Immigration', 'BOTH', 'v1.0', 1, 0, '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:32:52.802', '2026-11-25 09:32:52.802'),
('4d83a415-63e2-4a97-8fad-cf88036cefd0', 'CAT-245', 'Fiduciary discharge and closure letter (CAT-245)', 'Trigger: Administration closure approved | Fields: Final accounting, distributions, authority, remaining obligations', 'pa-prob', 'Probate', 'BOTH', 'v1.0', 1, 0, '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:39:01.771', '2026-11-25 09:39:01.771'),
('4dce74ee-04b3-4e0d-80b8-f94562a2d30e', 'CAT-080', 'Deposition outline and exhibit list (CAT-080)', 'Trigger: Preparation task opened | Fields: Witness, issues, source evidence, selected exhibits', 'pa-civ', 'Civil Litigation', 'BOTH', 'v1.0', 1, 0, '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:18:20.075', '2026-11-25 09:18:20.075'),
('4fe35276-a499-47c1-85aa-8a20f4bf9a93', '096', 'Representation Letter - Liability Carrier (Template 096)', 'Formal representation notice transmitted to liability insurance carrier on behalf of injured client.', 'pa-pi', 'Correspondence', 'DOCX', 'v1.0', 1, 1, '1a1c1f3c-1a81-47aa-bad3-ec5fd76b9730', '2026-11-14 09:29:36.759', '2026-11-14 09:29:36.759'),
('50d89734-ab18-4837-981a-bb0f37e6d74d', 'CAT-221', 'Estate and trust administration intake questionnaire (CAT-221)', 'Trigger: Administration matter opened | Fields: Decedent, instruments, fiduciaries, parties, property', 'pa-prob', 'Probate', 'BOTH', 'v1.0', 1, 0, '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:36:14.287', '2026-11-25 09:36:14.287'),
('5153c226-b50e-46e8-ad95-8815e0fc2da2', 'CAT-171', 'Chapter 13 plan draft (CAT-171)', 'Trigger: Plan proposal authorized | Fields: Income, claims, treatment, payments, district plan version', 'pa-bk', 'Bankruptcy', 'BOTH', 'v1.0', 1, 0, '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:29:31.214', '2026-11-25 09:29:31.214'),
('52e5ce80-078b-426a-ae9d-e34874abeb30', 'CAT-219', 'Immigration expiration and renewal notice (CAT-219)', 'Trigger: Reviewed expiration threshold reached | Fields: Document type, validity, case status, approved next steps', 'pa-imm', 'Immigration', 'BOTH', 'v1.0', 1, 0, '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:35:59.775', '2026-11-25 09:35:59.775'),
('53785f29-1971-4285-9016-8584e2e7144a', 'CAT-253', 'Property division proposal (CAT-253)', 'Trigger: Negotiation or trial planning authorized | Fields: Assets, debts, allocations, offsets, disputed assumptions', 'pa-fam', 'Family Law', 'BOTH', 'v1.0', 1, 0, '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:39:55.755', '2026-11-25 09:39:55.755'),
('540c0bae-c5f3-4dcc-9b8b-0870cf156c0b', 'CAT-066', 'Production cover letter and index (CAT-066)', 'Trigger: Production set approved | Fields: Recipients, Bates ranges, files, exclusions, delivery route', 'pa-civ', 'Civil Litigation', 'BOTH', 'v1.0', 1, 0, '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:16:39.847', '2026-11-25 09:16:39.847'),
('54fdfef6-a8d3-4466-85cb-1827742c44cd', 'CAT-256', 'Financial discovery request packet (CAT-256)', 'Trigger: Family discovery authorized | Fields: Issues, assets, income sources, targeted records, recipients', 'pa-fam', 'Family Law', 'BOTH', 'v1.0', 1, 0, '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:40:15.393', '2026-11-25 09:40:15.393'),
('552ab211-9000-4f8c-be4a-00cb35f3a83d', 'CAT-279', 'Probation compliance and violation response packet (CAT-279)', 'Trigger: Violation or compliance review opened | Fields: Conditions, allegations, evidence, client response, requested action', 'pa-crim', 'Criminal Defense', 'BOTH', 'v1.0', 1, 0, '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:43:00.472', '2026-11-25 09:43:00.472'),
('55e498aa-131b-420a-bfc7-0220ad1c4f86', 'CAT-122', 'Accident reconstruction expert instruction letter (CAT-122)', 'Trigger: Reconstruction assignment approved | Fields: Incident evidence, vehicles, issues, scope, deliverables', 'pa-pi', 'Personal Injury', 'BOTH', 'v1.0', 1, 0, '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:23:57.599', '2026-11-25 09:23:57.599'),
('5623b776-2e88-43c8-9533-77698c1a7ae8', 'CAT-032', 'Litigation hold notice to client (CAT-032)', 'Trigger: Preservation workflow activated | Fields: Custodians, sources, date ranges, approved instructions', 'pa-civ', 'Civil Litigation', 'BOTH', 'v1.0', 1, 0, '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:12:01.509', '2026-11-25 09:12:01.509'),
('57a26bf8-7951-4168-9b02-ca6cc6236bd9', 'CAT-089', 'Mediation statement (CAT-089)', 'Trigger: Mediation preparation begins | Fields: Claims, defenses, evidence, damages, settlement positions', 'pa-civ', 'Civil Litigation', 'BOTH', 'v1.0', 1, 0, '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:19:34.708', '2026-11-25 09:19:34.708'),
('58faf1f8-8dc7-4085-8c81-fe3bffd00502', 'CAT-249', 'Temporary orders motion packet (CAT-249)', 'Trigger: Temporary relief authorized | Fields: Requested terms, supporting facts, declarations, exhibits', 'pa-fam', 'Family Law', 'BOTH', 'v1.0', 1, 0, '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:39:28.396', '2026-11-25 09:39:28.396'),
('593ffb63-7e6f-43b0-a508-a3beeae76d80', 'CAT-099', 'Employer representation and wage record request (CAT-099)', 'Trigger: Employment damages collection activated | Fields: Client, employer, incident, lost work periods, authorization', 'pa-pi', 'Personal Injury', 'BOTH', 'v1.0', 1, 0, '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:20:55.585', '2026-11-25 09:20:55.585'),
('59a6f13c-1633-41ab-9048-aa5d5a6ac19c', 'CAT-133', 'Supplemental demand letter (CAT-133)', 'Trigger: Additional approved damages or evidence added | Fields: Prior demand, changes, new exhibits, recipient', 'pa-pi', 'Personal Injury', 'BOTH', 'v1.0', 1, 0, '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:25:15.933', '2026-11-25 09:25:15.933'),
('5c12bf3e-a55c-4ea0-b194-ed8374364d73', 'CAT-231', 'Bank and custodian authority letter (CAT-231)', 'Trigger: Authority documents approved | Fields: Fiduciary, institution, account, authority, requested records', 'pa-prob', 'Probate', 'BOTH', 'v1.0', 1, 0, '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:37:20.927', '2026-11-25 09:37:20.927'),
('5c7dedf1-567b-49b3-bd08-fc976754a23c', 'CAT-097', 'First party insurer letter of representation (CAT-097)', 'Trigger: First party coverage record saved | Fields: Client, incident, policy, carrier, first party claim', 'pa-pi', 'Personal Injury', 'BOTH', 'v1.0', 1, 0, '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:20:40.792', '2026-11-25 09:20:40.792'),
('5e2561f3-4fa5-4cf2-9309-c5229c217860', 'CAT-031', 'Litigation assessment memorandum (CAT-031)', 'Trigger: Litigation matter opened | Fields: Claims, defenses, remedies, issues, evidence gaps', 'pa-civ', 'Civil Litigation', 'BOTH', 'v1.0', 1, 0, '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:11:54.187', '2026-11-25 09:11:54.187'),
('5e82f7ca-6a43-42f1-85bc-39c3b79a5f29', 'CAT-155', 'Monthly household budget worksheet (CAT-155)', 'Trigger: Expense intake saved | Fields: Income, recurring expenses, household, supporting records', 'pa-bk', 'Bankruptcy', 'BOTH', 'v1.0', 1, 0, '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:27:47.278', '2026-11-25 09:27:47.278'),
('5ee133a0-6687-4e47-9dac-7a8ec1a899f8', 'CAT-148', 'Wrongful death beneficiary information questionnaire (CAT-148)', 'Trigger: Wrongful death branch selected | Fields: Decedent, beneficiaries, relationships, authority, supporting records', 'pa-pi', 'Personal Injury', 'BOTH', 'v1.0', 1, 0, '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:27:01.396', '2026-11-25 09:27:01.396'),
('61b207a4-ab85-48ec-b090-184567211d9c', 'CAT-203', 'Official Form I 140 draft (CAT-203)', 'Trigger: Immigrant worker petition selected | Fields: Petitioner or self petitioner, category, qualifications, evidence', 'pa-imm', 'Immigration', 'BOTH', 'v1.0', 1, 0, '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:34:04.500', '2026-11-25 09:34:04.500'),
('61b7a486-8769-4db8-826c-5559c35d9de7', 'CAT-244', 'Probate or trust settlement agreement (CAT-244)', 'Trigger: Contested matter terms authorized | Fields: Parties, claims, allocations, releases, performance conditions', 'pa-prob', 'Probate', 'BOTH', 'v1.0', 1, 0, '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:38:53.675', '2026-11-25 09:38:53.675'),
('635fd210-3e0e-45aa-b6bb-dbbad4dcbd19', 'CAT-183', 'Claim objection preparation packet (CAT-183)', 'Trigger: Claim challenge authorized | Fields: Claim record, grounds, evidence, proposed relief and notice', 'pa-bk', 'Bankruptcy', 'BOTH', 'v1.0', 1, 0, '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:31:18.939', '2026-11-25 09:31:18.939'),
('639076d0-5098-4940-812d-da9901a32e70', 'CAT-239', 'Final accounting and closing petition (CAT-239)', 'Trigger: Closing review authorized | Fields: Inventory, transactions, distributions, remaining duties, relief', 'pa-prob', 'Probate', 'BOTH', 'v1.0', 1, 0, '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:38:15.749', '2026-11-25 09:38:15.749'),
('63fd8887-c59d-4fa3-bdf7-e26f8a6f0f29', 'CAT-186', 'Immigration case intake questionnaire (CAT-186)', 'Trigger: Immigration matter opened | Fields: Case subtype, participants, languages, conditional questions', 'pa-imm', 'Immigration', 'BOTH', 'v1.0', 1, 0, '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:31:41.857', '2026-11-25 09:31:41.857'),
('641e5d63-4499-4c8c-9c16-485cb3b2e451', 'CAT-273', 'Criminal evidentiary motion packet (CAT-273)', 'Trigger: Evidentiary ruling requested | Fields: Evidence, issues, authorities, record, proposed ruling', 'pa-crim', 'Criminal Defense', 'BOTH', 'v1.0', 1, 0, '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:42:15.911', '2026-11-25 09:42:15.911'),
('642cb175-b448-4ca4-819e-3093c41b755e', 'CAT-184', 'Discharge and case outcome letter (CAT-184)', 'Trigger: Disposition entered and reviewed | Fields: Order, affected matters, remaining obligations, client instructions', 'pa-bk', 'Bankruptcy', 'BOTH', 'v1.0', 1, 0, '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:31:24.862', '2026-11-25 09:31:24.862'),
('64e92062-c626-449f-a04a-462455f13737', 'CAT-144', 'Settlement deposit allocation sheet (CAT-144)', 'Trigger: Settlement receipt recorded | Fields: Payors, client allocations, matter, trust account, availability', 'pa-pi', 'Personal Injury', 'BOTH', 'v1.0', 1, 0, '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:26:29.801', '2026-11-25 09:26:29.801'),
('64ebfa99-f1e5-4db6-b9d4-fb37d7aea2da', 'CAT-101', 'Incident fact summary (CAT-101)', 'Trigger: PI accident intake saved | Fields: Date, time, location, mechanism, parties, injuries, source status', 'pa-pi', 'Personal Injury', 'BOTH', 'v1.0', 1, 0, '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:21:13.110', '2026-11-25 09:21:13.110'),
('677a2c45-3247-4acb-af17-97e94baac5bd', 'CAT-259', 'Divorce settlement stipulation (CAT-259)', 'Trigger: Settlement terms authorized | Fields: Property, support, parenting, fees, performance obligations', 'pa-fam', 'Family Law', 'BOTH', 'v1.0', 1, 0, '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:40:34.614', '2026-11-25 09:40:34.614'),
('685974eb-6f65-4716-ad7d-f417f8f1ab14', 'CAT-009', 'Referral letter to another attorney (CAT-009)', 'Trigger: Referral authorized | Fields: Recipient, scope, consent, records approved for transfer', 'pa-civ', 'Engagement', 'BOTH', 'v1.0', 1, 1, '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:08:12.860', '2026-11-25 09:08:12.860'),
('6867ff26-def9-4eca-835d-7e30515cb997', 'CAT-260', 'Findings conclusions and decree draft (CAT-260)', 'Trigger: Resolution terms approved | Fields: Findings, approved terms, court disposition, related orders', 'pa-fam', 'Family Law', 'BOTH', 'v1.0', 1, 0, '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:40:41.743', '2026-11-25 09:40:41.743'),
('68cc00d8-1e43-47bd-a1b3-4c24b6add04e', 'CAT-200', 'Official Form I 864 draft (CAT-200)', 'Trigger: Affidavit of support package selected | Fields: Sponsor, household, income, assets, reviewed calculations', 'pa-imm', 'Immigration', 'BOTH', 'v1.0', 1, 0, '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:33:38.395', '2026-11-25 09:33:38.395'),
('6b6fe847-2081-417f-8ae1-1f0ab2141d52', 'CAT-251', 'Mandatory financial disclosure index (CAT-251)', 'Trigger: Disclosure set assembled | Fields: Required categories, files, periods, omissions, review status', 'pa-fam', 'Family Law', 'BOTH', 'v1.0', 1, 0, '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:39:41.551', '2026-11-25 09:39:41.551'),
('6bcade5f-6f22-40a3-993c-03e4abf417fa', 'CAT-246', 'Family law intake questionnaire (CAT-246)', 'Trigger: Family matter opened | Fields: Parties, children, proceedings, finances, safety restrictions', 'pa-fam', 'Family Law', 'BOTH', 'v1.0', 1, 0, '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:39:08.714', '2026-11-25 09:39:08.714'),
('6cc1d679-c136-4c1f-b262-6b3828305084', 'CAT-222', 'Heir and beneficiary information questionnaire (CAT-222)', 'Trigger: Interested party collection activated | Fields: Relationships, contact details, interests, supporting records', 'pa-prob', 'Probate', 'BOTH', 'v1.0', 1, 0, '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:36:20.721', '2026-11-25 09:36:20.721'),
('6d76eb8c-ffb2-4eee-8f43-c22b8346f05a', 'CAT-094', 'Jury instructions and verdict form packet (CAT-094)', 'Trigger: Jury trial preparation authorized | Fields: Claims, elements, approved authorities, proposed questions', 'pa-civ', 'Civil Litigation', 'BOTH', 'v1.0', 1, 0, '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:20:17.652', '2026-11-25 09:20:17.652'),
('6d9fa8c3-7ad5-4b60-be5f-0e9f0cf6d1da', 'CAT-135', 'Offer and counteroffer summary (CAT-135)', 'Trigger: Negotiation event recorded | Fields: Offer history, conditions, authority, projected net recovery', 'pa-pi', 'Personal Injury', 'BOTH', 'v1.0', 1, 0, '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:25:28.318', '2026-11-25 09:25:28.318'),
('6db22820-136d-410e-9aaf-03cf5dc19dff', 'CAT-291', 'Landlord tenant intake and lease review worksheet (CAT-291)', 'Trigger: Matter opened | Fields: Property, lease, parties, rent, possession, notices, representation role', 'pa-evict', 'Landlord-Tenant', 'BOTH', 'v1.0', 1, 0, '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:44:34.395', '2026-11-25 09:44:34.395'),
('6e02648b-dae4-4a6e-b63e-f81bed9db40b', 'CAT-109', 'Electronic vehicle data preservation request (CAT-109)', 'Trigger: Electronic vehicle evidence identified | Fields: Vehicle identifiers, custodians, incident, requested data', 'pa-pi', 'Personal Injury', 'BOTH', 'v1.0', 1, 0, '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:22:21.046', '2026-11-25 09:22:21.046'),
('6e4ad68d-1b70-4d87-8d26-a6283ce0ecdb', 'CAT-129', 'Demand readiness report (CAT-129)', 'Trigger: Demand readiness checked | Fields: Evidence checklist, missing items, owners, review status', 'pa-pi', 'Personal Injury', 'BOTH', 'v1.0', 1, 0, '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:24:45.504', '2026-11-25 09:24:45.504'),
('70000e17-bf77-4572-a1b2-81baf00478cb', 'CAT-150', 'PI closing letter and final recovery summary (CAT-150)', 'Trigger: Disbursement and closure review completed | Fields: Outcome, payments, remaining obligations, records, final accounting', 'pa-pi', 'Personal Injury', 'BOTH', 'v1.0', 1, 0, '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:27:15.761', '2026-11-25 09:27:15.761'),
('716b06dc-4a81-43d0-b69a-a7383799cc8a', 'CAT-006', 'Limited scope engagement agreement (CAT-006)', 'Trigger: Limited scope selected | Fields: Included tasks, exclusions, responsibilities, end condition', 'pa-civ', 'Engagement', 'BOTH', 'v1.0', 1, 1, '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:07:43.776', '2026-11-25 09:07:43.776'),
('718afda2-71d4-4725-a047-3bc1bda9c8a4', 'CAT-185', 'Bankruptcy closure and outstanding obligation report (CAT-185)', 'Trigger: Closing review triggered | Fields: Orders, plan duties, pending items, final documents, archive', 'pa-bk', 'Bankruptcy', 'BOTH', 'v1.0', 1, 0, '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:31:33.372', '2026-11-25 09:31:33.372'),
('71d031f4-79a0-4d53-b4fb-e6417ad3b831', 'CAT-067', 'Privilege log (CAT-067)', 'Trigger: Withheld records approved for logging | Fields: Record identifiers, privilege basis, participants, dates', 'pa-civ', 'Civil Litigation', 'BOTH', 'v1.0', 1, 0, '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:16:46.597', '2026-11-25 09:16:46.597'),
('738b35c7-3920-48c7-b79b-8cb396c96e0d', 'CAT-137', 'Lien and reimbursement claim inquiry (CAT-137)', 'Trigger: Potential lienholder identified | Fields: Client, claim, payment source, requested claim documentation', 'pa-pi', 'Personal Injury', 'BOTH', 'v1.0', 1, 0, '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:25:40.453', '2026-11-25 09:25:40.453'),
('73975f5c-4405-4d22-b0bc-593803ff78d0', 'CAT-214', 'Translation certification packet (CAT-214)', 'Trigger: Translation assigned for filing evidence | Fields: Translator, source document, language, translated version', 'pa-imm', 'Immigration', 'BOTH', 'v1.0', 1, 0, '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:35:22.673', '2026-11-25 09:35:22.673'),
('79ff6e5e-2416-4a6d-97ff-8d7376794622', 'CAT-104', 'Claim acknowledgment follow-up (CAT-104)', 'Trigger: Carrier acknowledgment not received by review date | Fields: Representation letter, delivery, claim reference, recipient', 'pa-pi', 'Personal Injury', 'BOTH', 'v1.0', 1, 0, '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:21:39.574', '2026-11-25 09:21:39.574'),
('7b899fe3-f6d8-4459-aa5f-3ecc4ebd1738', 'CAT-052', 'Stipulation extending response time (CAT-052)', 'Trigger: Extension agreed for drafting | Fields: Parties, affected deadline, proposed date, approval', 'pa-civ', 'Civil Litigation', 'BOTH', 'v1.0', 1, 0, '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:15:02.998', '2026-11-25 09:15:02.998'),
('7c042e87-f677-46a2-976b-9922914b8964', 'CAT-112', 'Medical authorization packet (CAT-112)', 'Trigger: Provider request workflow opened | Fields: Client identity, provider, authorized scope, dates, signature', 'pa-pi', 'Personal Injury', 'BOTH', 'v1.0', 1, 0, '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:22:44.662', '2026-11-25 09:22:44.662'),
('7c7d3683-ec7f-4dc3-8a15-e10b88a2e5c5', 'CAT-240', 'Trustee acceptance and administration notice (CAT-240)', 'Trigger: Trust administration opened | Fields: Trust instrument, trustee, beneficiaries, authority, notice scope', 'pa-prob', 'Probate', 'BOTH', 'v1.0', 1, 0, '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:38:22.229', '2026-11-25 09:38:22.229'),
('7e4b54e2-a9bf-401e-8520-3d9b03ec8cf7', 'CAT-083', 'Motion and supporting memorandum (CAT-083)', 'Trigger: Motion strategy authorized | Fields: Relief, facts, authorities, evidence, proposed schedule', 'pa-civ', 'Civil Litigation', 'BOTH', 'v1.0', 1, 0, '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:18:40.684', '2026-11-25 09:18:40.684'),
('802dcc2a-6a28-47cc-824a-2e1c0bb618d7', 'CAT-228', 'Creditor notice packet (CAT-228)', 'Trigger: Creditor notice authorized | Fields: Estate, fiduciary, recipients, approved notice text and dates', 'pa-prob', 'Probate', 'BOTH', 'v1.0', 1, 0, '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:37:02.335', '2026-11-25 09:37:02.335'),
('804007ee-d19b-40b4-810e-f7a2e4293ba3', 'CAT-115', 'Imaging and diagnostic study request (CAT-115)', 'Trigger: Imaging evidence requested | Fields: Client, facility, study dates, report and image formats', 'pa-pi', 'Personal Injury', 'BOTH', 'v1.0', 1, 0, '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:23:06.532', '2026-11-25 09:23:06.532'),
('8182054e-ac97-419f-882f-7a7d0bb82c77', 'CAT-110', 'Witness contact and statement request (CAT-110)', 'Trigger: PI witness assigned for contact | Fields: Witness, incident, authorized questions, contact method', 'pa-pi', 'Personal Injury', 'BOTH', 'v1.0', 1, 0, '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:22:27.806', '2026-11-25 09:22:27.806'),
('827cf62a-7bd4-4247-a109-031285334bdf', 'CAT-020', 'File retention review notice (CAT-020)', 'Trigger: Retention review date reached | Fields: Matter, policy, holds, proposed disposition, reviewer', 'pa-civ', 'Engagement', 'BOTH', 'v1.0', 1, 1, '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:10:10.077', '2026-11-25 09:10:10.077');
INSERT INTO `document_templates` (`id`, `template_code`, `template_name`, `description`, `practice_area_id`, `category`, `output_format`, `current_version`, `is_active`, `is_system_default`, `created_by_user_id`, `created_at`, `updated_at`) VALUES
('82cdf1c3-6fcd-429c-9e46-f4f782a25b4e', 'CAT-018', 'Client file transfer inventory and receipt (CAT-018)', 'Trigger: File transfer approved | Fields: Selected records, versions, recipient, delivery evidence', 'pa-civ', 'Engagement', 'BOTH', 'v1.0', 1, 1, '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:09:52.800', '2026-11-25 09:09:52.800'),
('82d1d761-13dd-4515-b34b-00b80e2fa423', 'CAT-216', 'Immigration missing information report (CAT-216)', 'Trigger: Package validation run | Fields: Missing answers, conflicts, signatures, documents, stale forms', 'pa-imm', 'Immigration', 'BOTH', 'v1.0', 1, 0, '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:35:38.301', '2026-11-25 09:35:38.301'),
('83f5943a-6036-4dd9-a198-009c5150773c', 'CAT-056', 'Initial disclosure statement (CAT-056)', 'Trigger: Disclosure workflow activated | Fields: Witnesses, documents, damages, insurance, source records', 'pa-civ', 'Civil Litigation', 'BOTH', 'v1.0', 1, 0, '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:15:33.591', '2026-11-25 09:15:33.591'),
('84843833-11aa-4709-87ad-1f81ff14f95c', 'CAT-173', 'Chapter 11 initial case preparation worksheet (CAT-173)', 'Trigger: Chapter 11 path authorized | Fields: Entity or debtor, operations, creditors, selected case subtype', 'pa-bk', 'Bankruptcy', 'BOTH', 'v1.0', 1, 0, '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:29:54.499', '2026-11-25 09:29:54.499'),
('85f599d8-adf2-4e81-a663-b0a440b7d424', 'CAT-058', 'Interrogatories (CAT-058)', 'Trigger: Outgoing discovery authorized | Fields: Responding party, approved questions, definitions, limits', 'pa-civ', 'Civil Litigation', 'BOTH', 'v1.0', 1, 0, '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:15:45.512', '2026-11-25 09:15:45.512'),
('86438632-8e05-401e-a4e3-616d51af7e71', 'CAT-019', 'Closing letter (CAT-019)', 'Trigger: Closing checklist reaches review | Fields: Outcome, remaining duties, originals, retention instructions', 'pa-civ', 'Engagement', 'BOTH', 'v1.0', 1, 1, '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:09:59.969', '2026-11-25 09:09:59.969'),
('88138846-d949-40d0-b990-be51bd4172cb', 'CAT-034', 'Preservation demand to opposing party (CAT-034)', 'Trigger: Attorney authorizes preservation request | Fields: Recipient, incident, evidence categories, scope', 'pa-civ', 'Civil Litigation', 'BOTH', 'v1.0', 1, 0, '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:12:19.440', '2026-11-25 09:12:19.440'),
('884b73af-9916-4e2f-b57a-a9e1d183994e', 'CAT-229', 'Asset and liability inventory (CAT-229)', 'Trigger: Verified estate records available | Fields: Property, ownership, valuation dates, debts, supporting documents', 'pa-prob', 'Probate', 'BOTH', 'v1.0', 1, 0, '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:37:08.500', '2026-11-25 09:37:08.500'),
('889c3da1-d927-44a4-98b6-00f7f8cee384', 'CAT-096', 'Liability insurer letter of representation (CAT-096)', 'Trigger: PI client and accident record saved | Fields: Client, accident, insured, insurer, adjuster, claim number', 'pa-pi', 'Personal Injury', 'BOTH', 'v1.0', 1, 0, '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:20:32.818', '2026-11-25 09:20:32.818'),
('8942d350-910c-4701-9752-ef655a421e7a', 'CAT-121', 'Medical bill review instruction letter (CAT-121)', 'Trigger: Bill review assigned | Fields: Bills, payments, adjustments, questions, selected records', 'pa-pi', 'Personal Injury', 'BOTH', 'v1.0', 1, 0, '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:23:50.365', '2026-11-25 09:23:50.365'),
('8a83200c-2735-4c3e-87ab-760827d37411', 'CAT-068', 'Protective order stipulation and proposed order (CAT-068)', 'Trigger: Protection terms negotiated | Fields: Protected categories, access, designation, return terms', 'pa-civ', 'Civil Litigation', 'BOTH', 'v1.0', 1, 0, '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:16:53.697', '2026-11-25 09:16:53.697'),
('8b6a3109-567b-42c2-a9cf-0650c7286fc1', 'CAT-265', 'Family matter closing and compliance letter (CAT-265)', 'Trigger: Closing review reached | Fields: Entered orders, ongoing duties, transfers, payment instructions', 'pa-fam', 'Family Law', 'BOTH', 'v1.0', 1, 0, '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:41:15.701', '2026-11-25 09:41:15.701'),
('8c004cfe-6bd8-4ca3-9225-e5b2f31f233d', 'CAT-029', 'Trust refund authorization (CAT-029)', 'Trigger: Refund condition approved | Fields: Client balance, holds, payee, amount, supporting reason', 'pa-civ', 'Engagement', 'BOTH', 'v1.0', 1, 1, '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:11:37.540', '2026-11-25 09:11:37.540'),
('8cd3fab1-1c12-41c5-9571-5b4f3ab10d14', 'CAT-164', 'Schedule G contracts and leases draft (CAT-164)', 'Trigger: Executory contract review completed | Fields: Counterparties, agreements, property, proposed treatment', 'pa-bk', 'Bankruptcy', 'BOTH', 'v1.0', 1, 0, '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:28:41.155', '2026-11-25 09:28:41.155'),
('8d6db27c-dbd8-4428-959d-be551d8e28a9', 'CAT-293', 'Attorney selected termination or cure notice (CAT-293)', 'Trigger: Notice ground and form approved | Fields: Lease, property, recipients, approved grounds and cure terms', 'pa-evict', 'Landlord-Tenant', 'BOTH', 'v1.0', 1, 0, '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:44:49.450', '2026-11-25 09:44:49.450'),
('8d8e0e86-89c1-4247-b7e3-31efb7ec0b5d', 'CAT-212', 'Immigration filing cover letter (CAT-212)', 'Trigger: Reviewed package assembled | Fields: Recipient, forms, filing basis, fees, evidence list', 'pa-imm', 'Immigration', 'BOTH', 'v1.0', 1, 0, '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:35:06.952', '2026-11-25 09:35:06.952'),
('8f35556c-8b73-4c84-8514-6eeec0553388', 'CAT-223', 'Estate document request letter (CAT-223)', 'Trigger: Administration checklist assigned | Fields: Will, trust, death records, assets, debts, tax information', 'pa-prob', 'Probate', 'BOTH', 'v1.0', 1, 0, '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:36:27.490', '2026-11-25 09:36:27.490'),
('90d73340-06e0-4cdd-9e5d-832f23af8f8c', 'CAT-015', 'Client authority confirmation (CAT-015)', 'Trigger: Attorney records proposed decision | Fields: Decision terms, material conditions, approval method', 'pa-civ', 'Engagement', 'BOTH', 'v1.0', 1, 1, '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:09:18.012', '2026-11-25 09:09:18.012'),
('9130ac1b-ec73-4803-9e2c-c0238a63131c', 'CAT-016', 'Scope amendment letter (CAT-016)', 'Trigger: Representation scope changed | Fields: Original agreement, new tasks, fee changes, effective date', 'pa-civ', 'Engagement', 'BOTH', 'v1.0', 1, 1, '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:09:30.940', '2026-11-25 09:09:30.940'),
('915cb878-936d-4cea-ae86-7c73f18e64e6', 'CAT-252', 'Marital asset and debt schedule (CAT-252)', 'Trigger: Property data reviewed | Fields: Ownership, values, valuation dates, debts, claimed characterization', 'pa-fam', 'Family Law', 'BOTH', 'v1.0', 1, 0, '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:39:47.060', '2026-11-25 09:39:47.060'),
('919d37b4-ce64-4c79-97f5-eb2bbb291799', 'CAT-263', 'Petition to modify decree (CAT-263)', 'Trigger: Modification proceeding authorized | Fields: Existing order, proposed changes, supporting facts, relief', 'pa-fam', 'Family Law', 'BOTH', 'v1.0', 1, 0, '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:41:02.182', '2026-11-25 09:41:02.182'),
('91bafe08-dbf6-4099-a316-f4720ff54682', 'CAT-286', 'Appellate response brief draft (CAT-286)', 'Trigger: Response briefing assigned | Fields: Opening brief, issues, record, authorities, approved arguments', 'pa-app', 'Appeals', 'BOTH', 'v1.0', 1, 0, '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:43:59.878', '2026-11-25 09:43:59.878'),
('92c2a993-9d6e-4be3-a19b-30e334ca9696', 'CAT-157', 'Creditor and debt review worksheet (CAT-157)', 'Trigger: Creditor data imported or entered | Fields: Creditor, addresses, account, amount, classification, disputes', 'pa-bk', 'Bankruptcy', 'BOTH', 'v1.0', 1, 0, '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:27:59.859', '2026-11-25 09:27:59.859'),
('934f0a32-65b0-4c9d-876f-27675eea13f0', 'CAT-254', 'Parenting plan proposal (CAT-254)', 'Trigger: Parenting position authorized | Fields: Children, schedules, exchanges, decisions, restrictions, holidays', 'pa-fam', 'Family Law', 'BOTH', 'v1.0', 1, 0, '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:40:01.513', '2026-11-25 09:40:01.513'),
('93a6523b-cbe3-47eb-85b1-89ebf347dd65', 'CAT-188', 'Beneficiary history questionnaire (CAT-188)', 'Trigger: Beneficiary linked | Fields: Identity, family, residences, employment, immigration history', 'pa-imm', 'Immigration', 'BOTH', 'v1.0', 1, 0, '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:32:01.647', '2026-11-25 09:32:01.647'),
('94547c36-b00f-42db-9449-cd8900037bc2', 'CAT-238', 'Final distribution and reserve schedule (CAT-238)', 'Trigger: Closing distribution planned | Fields: Assets, expenses, entitlements, holdbacks, approved allocations', 'pa-prob', 'Probate', 'BOTH', 'v1.0', 1, 0, '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:38:08.829', '2026-11-25 09:38:08.829'),
('959e8202-4d3a-4c4a-a398-17f150aa32a4', 'CAT-142', 'Settlement release review checklist (CAT-142)', 'Trigger: Proposed release received | Fields: Parties, scope, terms, liens, indemnity, approval issues', 'pa-pi', 'Personal Injury', 'BOTH', 'v1.0', 1, 0, '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:26:14.955', '2026-11-25 09:26:14.955'),
('95fd09d4-8e6e-47b5-a525-1bfd131fd85c', 'CAT-059', 'Requests for production (CAT-059)', 'Trigger: Outgoing production request authorized | Fields: Custodians, document categories, periods, requested format', 'pa-civ', 'Civil Litigation', 'BOTH', 'v1.0', 1, 0, '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:15:54.643', '2026-11-25 09:15:54.643'),
('962821f6-1816-4d4e-96d9-b919c996e014', 'CAT-288', 'Oral argument preparation memorandum (CAT-288)', 'Trigger: Argument scheduled | Fields: Panel information where known, issues, record, questions, relief', 'pa-app', 'Appeals', 'BOTH', 'v1.0', 1, 0, '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:44:14.592', '2026-11-25 09:44:14.592'),
('96ab1868-47d9-4e48-8ad3-a4272f49403f', 'CAT-070', 'Clawback request (CAT-070)', 'Trigger: Disclosure issue identified for review | Fields: Affected files, recipients, asserted basis, requested action', 'pa-civ', 'Civil Litigation', 'BOTH', 'v1.0', 1, 0, '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:17:06.680', '2026-11-25 09:17:06.680'),
('96e51fc4-20d8-47b3-b89d-5c800476be3f', 'CAT-090', 'Settlement agreement and release (CAT-090)', 'Trigger: Settlement terms authorized | Fields: Parties, consideration, release scope, conditions, signatures', 'pa-civ', 'Civil Litigation', 'BOTH', 'v1.0', 1, 0, '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:19:44.491', '2026-11-25 09:19:44.491'),
('977beebc-485b-4fee-90bb-7aed3b66a9a3', 'CAT-140', 'Lien payoff confirmation request (CAT-140)', 'Trigger: Proposed payoff agreement recorded | Fields: Lienholder, agreed amount, release terms, payment instructions', 'pa-pi', 'Personal Injury', 'BOTH', 'v1.0', 1, 0, '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:25:58.891', '2026-11-25 09:25:58.891'),
('990d7be2-2fe7-4679-ae52-6af84e469504', 'CAT-278', 'Restitution review and objection packet (CAT-278)', 'Trigger: Restitution request reviewed | Fields: Claimed losses, evidence, payments, objections, relief', 'pa-crim', 'Criminal Defense', 'BOTH', 'v1.0', 1, 0, '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:42:52.489', '2026-11-25 09:42:52.489'),
('9a5083a6-7aac-498a-b816-c5989c4bbe74', 'CAT-057', 'Supplemental disclosure statement (CAT-057)', 'Trigger: Approved disclosure information changes | Fields: New material, prior disclosure, recipients, version', 'pa-civ', 'Civil Litigation', 'BOTH', 'v1.0', 1, 0, '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:15:39.655', '2026-11-25 09:15:39.655'),
('9a5ed805-6f2b-4d90-a57f-ed9df5739dbd', 'CAT-247', 'Divorce petition (CAT-247)', 'Trigger: Divorce filing authorized | Fields: Parties, children, jurisdiction facts, grounds, requested relief', 'pa-fam', 'Family Law', 'BOTH', 'v1.0', 1, 0, '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:39:14.262', '2026-11-25 09:39:14.262'),
('9af6671e-815b-4e3e-bbe6-5c59fc6d40d2', 'CAT-287', 'Appellate reply brief draft (CAT-287)', 'Trigger: Reply briefing assigned | Fields: Response issues, record references, approved reply arguments', 'pa-app', 'Appeals', 'BOTH', 'v1.0', 1, 0, '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:44:07.839', '2026-11-25 09:44:07.839'),
('9b1a25a8-2f13-4b44-a1b2-202f406519d7', 'CAT-224', 'Probate opening petition or application (CAT-224)', 'Trigger: Opening proceeding authorized | Fields: Decedent, venue facts, instruments, heirs, proposed fiduciary', 'pa-prob', 'Probate', 'BOTH', 'v1.0', 1, 0, '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:36:33.810', '2026-11-25 09:36:33.810'),
('9c4d5972-d996-444c-912a-a66a134d4d57', 'CAT-165', 'Schedule H codebtors draft (CAT-165)', 'Trigger: Codebtor records approved | Fields: Codebtors, related creditors, addresses, debt references', 'pa-bk', 'Bankruptcy', 'BOTH', 'v1.0', 1, 0, '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:28:47.493', '2026-11-25 09:28:47.493'),
('9cbd4d8f-da1a-4185-8e46-7f480575b0c5', 'CAT-199', 'Official Form I 131 draft (CAT-199)', 'Trigger: Travel document preparation selected | Fields: Applicant, requested document, travel facts, verified edition', 'pa-imm', 'Immigration', 'BOTH', 'v1.0', 1, 0, '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:33:30.964', '2026-11-25 09:33:30.964'),
('9ed7c292-f725-44db-bb97-a2db35587d7e', 'CAT-201', 'Official Form I 864A draft (CAT-201)', 'Trigger: Household member support path selected | Fields: Household member, sponsor, income, approved obligations', 'pa-imm', 'Immigration', 'BOTH', 'v1.0', 1, 0, '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:33:50.854', '2026-11-25 09:33:50.854'),
('9f032c21-ffc9-4f99-8051-3fb661f63515', 'CAT-039', 'Contract notice and opportunity to cure (CAT-039)', 'Trigger: Attorney selects contractual notice path | Fields: Agreement, clause, breach, delivery terms, cure demand', 'pa-civ', 'Civil Litigation', 'BOTH', 'v1.0', 1, 0, '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:13:05.421', '2026-11-25 09:13:05.421'),
('9f47fb05-1a38-4977-bfc7-8c872bdb60dc', 'CAT-098', 'Provider representation and record preservation letter (CAT-098)', 'Trigger: Treating provider linked to PI matter | Fields: Client, incident, provider, treatment dates, requested preservation', 'pa-pi', 'Personal Injury', 'BOTH', 'v1.0', 1, 0, '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:20:48.401', '2026-11-25 09:20:48.401'),
('9f5f0b07-905a-4f4c-b61d-e6fda47d7f15', 'CAT-275', 'Client plea decision acknowledgment (CAT-275)', 'Trigger: Client decision recorded | Fields: Offer version, approved advice, decision, execution', 'pa-crim', 'Criminal Defense', 'BOTH', 'v1.0', 1, 0, '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:42:30.175', '2026-11-25 09:42:30.175'),
('9fba8d28-c649-420b-9148-b3cc17b152cd', 'CAT-151', 'Bankruptcy client questionnaire (CAT-151)', 'Trigger: Bankruptcy matter opened | Fields: Debtor type, chapter path, household, financial questions', 'pa-bk', 'Bankruptcy', 'BOTH', 'v1.0', 1, 0, '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:27:22.513', '2026-11-25 09:27:22.513'),
('a02c52f2-2b43-4509-b863-8a2c9b1f4c48', 'CAT-196', 'Official Form I 130A draft (CAT-196)', 'Trigger: Applicable spouse package selected | Fields: Beneficiary details, histories, interpreter, verified edition', 'pa-imm', 'Immigration', 'BOTH', 'v1.0', 1, 0, '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:33:09.779', '2026-11-25 09:33:09.779'),
('a1782b10-81a1-4784-a9a7-da6bddde477d', 'CAT-065', 'Supplemental discovery responses (CAT-065)', 'Trigger: Approved response facts change | Fields: Affected requests, revised answers, new documents', 'pa-civ', 'Civil Litigation', 'BOTH', 'v1.0', 1, 0, '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:16:33.611', '2026-11-25 09:16:33.611'),
('a1dad545-e77d-4473-811f-566ff4b2c84a', 'CAT-156', 'Asset inventory and valuation worksheet (CAT-156)', 'Trigger: Asset intake completed | Fields: Ownership, description, value, valuation source, liens', 'pa-bk', 'Bankruptcy', 'BOTH', 'v1.0', 1, 0, '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:27:54.188', '2026-11-25 09:27:54.188'),
('a52f1641-8eca-4f09-97d6-68c1b549b9e7', 'CAT-049', 'Third party complaint (CAT-049)', 'Trigger: Third party proceeding authorized | Fields: New party, claim, permission status, service plan', 'pa-civ', 'Civil Litigation', 'BOTH', 'v1.0', 1, 0, '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:14:36.880', '2026-11-25 09:14:36.880'),
('a5abbe7f-a73c-46d1-8afd-f256708c44b1', 'CAT-095', 'Judgment fee cost and enforcement packet (CAT-095)', 'Trigger: Postjudgment tasks selected | Fields: Judgment, fee records, costs, interest inputs, selected remedies', 'pa-civ', 'Civil Litigation', 'BOTH', 'v1.0', 1, 0, '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:20:26.060', '2026-11-25 09:20:26.060'),
('a6321023-eea0-4702-9574-d19cc9ff01aa', 'CAT-043', 'Service instruction packet (CAT-043)', 'Trigger: Service task opened | Fields: Party, address, documents, method, process server', 'pa-civ', 'Civil Litigation', 'BOTH', 'v1.0', 1, 0, '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:13:47.034', '2026-11-25 09:13:47.034'),
('a7608ee5-2ba3-4698-ac14-16aae4a07522', 'CAT-262', 'Property transfer and compliance instructions (CAT-262)', 'Trigger: Decree entered and reviewed | Fields: Transfers, refinancing, signatures, deadlines, responsible parties', 'pa-fam', 'Family Law', 'BOTH', 'v1.0', 1, 0, '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:40:56.254', '2026-11-25 09:40:56.254'),
('a7f5e972-f097-4c66-ab84-74331b79562f', 'CAT-022', 'Account statement (CAT-022)', 'Trigger: Statement cycle reached | Fields: Invoices, payments, credits, balances, dates', 'pa-civ', 'Engagement', 'BOTH', 'v1.0', 1, 1, '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:10:27.131', '2026-11-25 09:10:27.131'),
('aaaeebe6-da02-44fb-8f27-f4b2104b0caa', 'CAT-177', 'Emergency filing completion checklist (CAT-177)', 'Trigger: Attorney selects emergency filing path | Fields: Initial package, outstanding documents, reviewed dates, owners', 'pa-bk', 'Bankruptcy', 'BOTH', 'v1.0', 1, 0, '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:30:28.757', '2026-11-25 09:30:28.757'),
('ab1eee5b-b729-4d66-8791-de39ed6315ab', 'CAT-167', 'Schedule J expenses draft (CAT-167)', 'Trigger: Budget verification completed | Fields: Dependents, monthly expenses, changes, supporting records', 'pa-bk', 'Bankruptcy', 'BOTH', 'v1.0', 1, 0, '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:29:00.511', '2026-11-25 09:29:00.511'),
('ab61154d-b6f2-4516-ab09-bc61024b7138', 'CAT-277', 'Sentencing memorandum and mitigation index (CAT-277)', 'Trigger: Sentencing preparation activated | Fields: Client history, mitigation, reports, proposed disposition', 'pa-crim', 'Criminal Defense', 'BOTH', 'v1.0', 1, 0, '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:42:45.141', '2026-11-25 09:42:45.141'),
('ae569c47-75e4-4bf0-a06c-ced476f0112a', 'CAT-272', 'Suppression motion packet (CAT-272)', 'Trigger: Suppression strategy authorized | Fields: Evidence, acquisition facts, authorities, declarations, relief', 'pa-crim', 'Criminal Defense', 'BOTH', 'v1.0', 1, 0, '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:42:08.360', '2026-11-25 09:42:08.360'),
('aec0385d-fc2d-4209-8651-e379015d92f4', 'CAT-063', 'Admission responses and objections (CAT-063)', 'Trigger: Incoming admissions assigned | Fields: Request text, client response, support, reviewer', 'pa-civ', 'Civil Litigation', 'BOTH', 'v1.0', 1, 0, '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:16:20.040', '2026-11-25 09:16:20.040'),
('aec9fbb6-5578-4c5b-98c5-8d52c4482ce2', 'CAT-154', 'Income and six month calculation worksheet (CAT-154)', 'Trigger: Income records verified | Fields: Income sources, periods, household, versioned calculation inputs', 'pa-bk', 'Bankruptcy', 'BOTH', 'v1.0', 1, 0, '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:27:41.448', '2026-11-25 09:27:41.448'),
('aedb4eeb-16cf-402a-a4cb-5fd6bd5fd9ee', 'CAT-054', 'Scheduling conference statement (CAT-054)', 'Trigger: Scheduling event confirmed | Fields: Issues, discovery needs, witnesses, proposed schedule', 'pa-civ', 'Civil Litigation', 'BOTH', 'v1.0', 1, 0, '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:15:19.926', '2026-11-25 09:15:19.926'),
('aede9ec6-f291-4613-a057-3b6c1d5c9b21', 'CAT-061', 'Interrogatory responses and objections (CAT-061)', 'Trigger: Incoming interrogatories assigned | Fields: Request text, verified answers, objections, reviewer', 'pa-civ', 'Civil Litigation', 'BOTH', 'v1.0', 1, 0, '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:16:06.548', '2026-11-25 09:16:06.548'),
('af4250cb-54a0-4464-b14c-9f8798f4786b', 'CAT-111', 'Photograph and video evidence request (CAT-111)', 'Trigger: Evidence collection checklist assigned | Fields: Client or custodian, requested media, incident, upload route', 'pa-pi', 'Personal Injury', 'BOTH', 'v1.0', 1, 0, '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:22:36.613', '2026-11-25 09:22:36.613'),
('b1d7a59d-d48e-4c6c-b763-2f7dc300c424', 'CAT-176', 'Bankruptcy filing package index (CAT-176)', 'Trigger: Approved filing set assembled | Fields: Form versions, attachments, matrix, certificates, required items', 'pa-bk', 'Bankruptcy', 'BOTH', 'v1.0', 1, 0, '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:30:20.873', '2026-11-25 09:30:20.873'),
('b22b2ef8-3814-4027-8565-c475c7afda14', 'CAT-041', 'Civil cover sheet (CAT-041)', 'Trigger: Initial filing package created | Fields: Court, parties, case type, attorney, classifications', 'pa-civ', 'Civil Litigation', 'BOTH', 'v1.0', 1, 0, '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:13:30.201', '2026-11-25 09:13:30.201'),
('b2bb0ace-6200-4dd8-84ae-d7c5627f62b9', 'CAT-213', 'Immigration exhibit index (CAT-213)', 'Trigger: Evidence set approved | Fields: Exhibit order, participants, descriptions, files, versions', 'pa-imm', 'Immigration', 'BOTH', 'v1.0', 1, 0, '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:35:14.725', '2026-11-25 09:35:14.725'),
('b2ef4f4b-c4fa-493b-b3c7-9f22005c81e7', 'CAT-128', 'Client treatment update questionnaire (CAT-128)', 'Trigger: Treatment follow-up interval reached | Fields: Providers, appointments, symptoms, work status, new records', 'pa-pi', 'Personal Injury', 'BOTH', 'v1.0', 1, 0, '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:24:36.756', '2026-11-25 09:24:36.756'),
('b309d8f0-365d-4413-a177-03f3695dbab2', 'CAT-204', 'Official Form I 539 draft (CAT-204)', 'Trigger: Status extension or change selected | Fields: Applicants, status, request, history, supporting documents', 'pa-imm', 'Immigration', 'BOTH', 'v1.0', 1, 0, '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:34:10.516', '2026-11-25 09:34:10.516'),
('b4ed39bc-5378-4585-a0cb-591ca18c55f5', 'CAT-269', 'Motion to modify release conditions (CAT-269)', 'Trigger: Modification request authorized | Fields: Existing conditions, proposed changes, supporting evidence', 'pa-crim', 'Criminal Defense', 'BOTH', 'v1.0', 1, 0, '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:41:44.613', '2026-11-25 09:41:44.613'),
('b565cbc6-f960-410c-9259-264998e8eb36', '113', 'Medical Records & Billing Request (Template 113)', 'Formal request for certified medical records, itemized billing statements, and treatment notes.', 'pa-pi', 'Medical', 'DOCX', 'v1.0', 1, 1, '1a1c1f3c-1a81-47aa-bad3-ec5fd76b9730', '2026-11-14 09:29:43.932', '2026-11-14 09:29:43.932'),
('b5a7f4a0-0612-4365-883b-168b64f39655', 'CAT-232', 'Estate property sale approval packet (CAT-232)', 'Trigger: Sale approval workflow selected | Fields: Property, authority, terms, valuation, required consents or order', 'pa-prob', 'Probate', 'BOTH', 'v1.0', 1, 0, '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:37:27.290', '2026-11-25 09:37:27.290'),
('b5bab9e2-0c95-4253-8caa-c62d47faff60', 'CAT-152', 'Bankruptcy document request checklist (CAT-152)', 'Trigger: Questionnaire path assigned | Fields: Chapter, periods, missing financial evidence, certificates', 'pa-bk', 'Bankruptcy', 'BOTH', 'v1.0', 1, 0, '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:27:27.990', '2026-11-25 09:27:27.990'),
('b627f363-1ebf-41a6-adce-b91eb033d79a', 'CAT-175', 'Pre filing inconsistency report (CAT-175)', 'Trigger: Package validation run | Fields: Questionnaire, documents, mapped forms, missing or conflicting values', 'pa-bk', 'Bankruptcy', 'BOTH', 'v1.0', 1, 0, '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:30:11.806', '2026-11-25 09:30:11.806'),
('b9511a5b-cca7-4389-ba15-5e31f1c13a41', 'CAT-055', 'Discovery plan and proposed scheduling order (CAT-055)', 'Trigger: Planning task opened | Fields: Case tier or track, proposed dates, disputed items', 'pa-civ', 'Civil Litigation', 'BOTH', 'v1.0', 1, 0, '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:15:27.042', '2026-11-25 09:15:27.042'),
('b99ff5a3-007f-4ac6-b14c-c940f0d4cbd1', 'CAT-117', 'Overdue medical request reminder (CAT-117)', 'Trigger: Records follow-up reaches due date | Fields: Provider, request, authorization, fees, outstanding items', 'pa-pi', 'Personal Injury', 'BOTH', 'v1.0', 1, 0, '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:23:20.542', '2026-11-25 09:23:20.542'),
('ba416e5e-46a2-4a60-a9ed-646edcdb2c1f', 'CAT-073', 'Discovery dispute statement (CAT-073)', 'Trigger: Dispute submission authorized | Fields: Issues, requests, positions, conference history, relief', 'pa-civ', 'Civil Litigation', 'BOTH', 'v1.0', 1, 0, '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:17:33.084', '2026-11-25 09:17:33.084'),
('ba5e47be-d226-4d98-8b07-899aa5a92263', 'CAT-033', 'Custodian preservation acknowledgment (CAT-033)', 'Trigger: Hold recipient added | Fields: Custodian, hold version, acknowledgment method', 'pa-civ', 'Civil Litigation', 'BOTH', 'v1.0', 1, 0, '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:12:09.936', '2026-11-25 09:12:09.936'),
('bb217cbb-acd0-4a4d-b050-7cdc4d578d85', 'CAT-143', 'Settlement disbursement statement (CAT-143)', 'Trigger: Settlement model ready for review | Fields: Gross recovery, fee terms, expenses, payoffs, reserves, net', 'pa-pi', 'Personal Injury', 'BOTH', 'v1.0', 1, 0, '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:26:22.331', '2026-11-25 09:26:22.331'),
('bb7d06b3-b919-46ad-a288-70991eecfe7e', 'CAT-012', 'Missing document reminder (CAT-012)', 'Trigger: Request follow-up becomes due | Fields: Outstanding items, previous request, owner, follow-up date', 'pa-civ', 'Engagement', 'BOTH', 'v1.0', 1, 1, '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:08:39.470', '2026-11-25 09:08:39.470'),
('be169230-d4d5-46fd-8d39-091ecb4e0dc2', 'CAT-190', 'Employer immigration questionnaire (CAT-190)', 'Trigger: Employer petition path selected | Fields: Entity, signatory, job, worksite, wages, employment facts', 'pa-imm', 'Immigration', 'BOTH', 'v1.0', 1, 0, '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:32:16.690', '2026-11-25 09:32:16.690'),
('bf5f76d9-851f-435a-881c-9492beaf80e0', 'CAT-081', 'Expert engagement letter (CAT-081)', 'Trigger: Expert retained | Fields: Scope, rates, materials, deliverables, review dates', 'pa-civ', 'Civil Litigation', 'BOTH', 'v1.0', 1, 0, '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:18:27.169', '2026-11-25 09:18:27.169'),
('c0289a35-e95a-43d1-9b6f-bbb9dba831ea', 'CAT-005', 'Contingency fee agreement (CAT-005)', 'Trigger: Contingency arrangement selected | Fields: Clients, fee terms, cost treatment, covered claims', 'pa-civ', 'Engagement', 'BOTH', 'v1.0', 1, 1, '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:07:28.820', '2026-11-25 09:07:28.820'),
('c2ccd2d2-9a66-4d88-9d2d-d02da2b9e12d', 'CAT-106', 'Emergency dispatch record request (CAT-106)', 'Trigger: Attorney selects dispatch evidence | Fields: Incident time and place, agency, recording types, scope', 'pa-pi', 'Personal Injury', 'BOTH', 'v1.0', 1, 0, '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:21:57.086', '2026-11-25 09:21:57.086'),
('c3e64925-e5bb-4e4e-807f-6d7d8801b09a', 'CAT-280', 'Criminal outcome and postjudgment instructions (CAT-280)', 'Trigger: Disposition reviewed | Fields: Order, obligations, reviewed dates, further review decisions', 'pa-crim', 'Criminal Defense', 'BOTH', 'v1.0', 1, 0, '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:43:07.970', '2026-11-25 09:43:07.970'),
('c3fc089d-81d3-4d48-a810-8b3af2746256', 'CAT-283', 'Transcript order and record designation packet (CAT-283)', 'Trigger: Record preparation activated | Fields: Proceedings, dates, reporters, selected record items', 'pa-app', 'Appeals', 'BOTH', 'v1.0', 1, 0, '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:43:34.906', '2026-11-25 09:43:34.906'),
('c49fd54e-f859-4ca8-904b-e8fd50110629', 'CAT-008', 'Nonengagement letter (CAT-008)', 'Trigger: Attorney declines inquiry | Fields: Prospect, consultation, decision, approved closing instructions', 'pa-civ', 'Engagement', 'BOTH', 'v1.0', 1, 1, '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:08:03.435', '2026-11-25 09:08:03.435'),
('c59581fa-05fb-470d-8673-fd8a8c6bd2e8', 'CAT-208', 'Official Form I 918 draft (CAT-208)', 'Trigger: U status preparation authorized | Fields: Applicant, qualifying facts, certifications, evidence, edition', 'pa-imm', 'Immigration', 'BOTH', 'v1.0', 1, 0, '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:34:36.019', '2026-11-25 09:34:36.019'),
('c5af8efc-98d2-4685-91bb-3ef8dd772a28', 'CAT-158', 'Creditor mailing matrix (CAT-158)', 'Trigger: Approved creditor set prepared | Fields: Verified notice names and addresses, district format', 'pa-bk', 'Bankruptcy', 'BOTH', 'v1.0', 1, 0, '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:28:06.109', '2026-11-25 09:28:06.109'),
('c66417ec-45ef-4326-a78a-1441fe43d39e', 'CAT-138', 'Lien itemization and supporting document request (CAT-138)', 'Trigger: Asserted lien entered | Fields: Claimant, asserted amount, payment details, requested support', 'pa-pi', 'Personal Injury', 'BOTH', 'v1.0', 1, 0, '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:25:46.767', '2026-11-25 09:25:46.767'),
('c773d52b-f4d7-4a8b-af0b-4c08c8c35137', 'CAT-149', 'Wrongful death allocation proposal (CAT-149)', 'Trigger: Allocation planning authorized | Fields: Claimants, recovery, approved allocation inputs, required approvals', 'pa-pi', 'Personal Injury', 'BOTH', 'v1.0', 1, 0, '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:27:08.713', '2026-11-25 09:27:08.713'),
('c9f42ba9-75a6-4060-86db-fed7c849b7a8', 'CAT-130', 'Settlement demand cover letter (CAT-130)', 'Trigger: Demand draft event recorded | Fields: Recipient, claim, accident, amount, response instructions', 'pa-pi', 'Personal Injury', 'BOTH', 'v1.0', 1, 0, '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:24:55.871', '2026-11-25 09:24:55.871'),
('ca7943ca-3f32-412f-a088-847eb0b2b940', 'CAT-281', 'Appellate intake and jurisdiction review memorandum (CAT-281)', 'Trigger: Appeal matter opened | Fields: Order, parties, service and entry events, selected review path', 'pa-app', 'Appeals', 'BOTH', 'v1.0', 1, 0, '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:43:19.390', '2026-11-25 09:43:19.390'),
('cb8b4aeb-1c40-40ce-bded-7f8cbc2d298f', 'CAT-233', 'Creditor claim review worksheet (CAT-233)', 'Trigger: Claim entered | Fields: Creditor, amount, basis, evidence, status, attorney decision', 'pa-prob', 'Probate', 'BOTH', 'v1.0', 1, 0, '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:37:34.236', '2026-11-25 09:37:34.236'),
('cc32036f-db71-4c1e-a1cd-3c0e1866686d', 'CAT-028', 'Earned fee transfer authorization (CAT-028)', 'Trigger: Eligible invoice approved | Fields: Earned fees, available client funds, approvers, accounts', 'pa-civ', 'Engagement', 'BOTH', 'v1.0', 1, 1, '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:11:28.516', '2026-11-25 09:11:28.516'),
('ccb68134-c0b2-4e64-a0e4-32c78da7515b', 'CAT-235', 'Beneficiary accounting report (CAT-235)', 'Trigger: Accounting review period reached | Fields: Receipts, disbursements, assets, liabilities, allocations', 'pa-prob', 'Probate', 'BOTH', 'v1.0', 1, 0, '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:37:47.374', '2026-11-25 09:37:47.374'),
('cccb8b59-3baa-43b0-9275-dc2d72759fa7', 'CAT-274', 'Plea offer comparison and advice memorandum (CAT-274)', 'Trigger: Plea proposal received | Fields: Counts, terms, exposure inputs, consequences for attorney review', 'pa-crim', 'Criminal Defense', 'BOTH', 'v1.0', 1, 0, '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:42:22.666', '2026-11-25 09:42:22.666'),
('cdc1fc7f-6b0d-48c7-87bc-f24fedb78e14', 'CAT-002', 'Prospective client questionnaire (CAT-002)', 'Trigger: Prospect saved | Fields: Practice subtype, participants, conditional questions', 'pa-civ', 'Engagement', 'BOTH', 'v1.0', 1, 1, '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:06:57.490', '2026-11-25 09:06:57.490'),
('cde595ed-fe2f-4cf0-bf1a-dec6ce1b9ab0', 'CAT-243', 'Petition for trust instructions (CAT-243)', 'Trigger: Court instructions authorized | Fields: Trust terms, issue, parties, evidence, requested direction', 'pa-prob', 'Probate', 'BOTH', 'v1.0', 1, 0, '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:38:43.357', '2026-11-25 09:38:43.357'),
('cfec6c52-0ff2-42e3-bc80-7adfa7d4d7ba', 'CAT-210', 'Official Form I 601 draft (CAT-210)', 'Trigger: Waiver preparation authorized | Fields: Applicant, selected grounds, qualifying relationships, evidence', 'pa-imm', 'Immigration', 'BOTH', 'v1.0', 1, 0, '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:34:49.041', '2026-11-25 09:34:49.041'),
('d12b9f0a-700e-4e27-8054-6f763f2c5a5b', 'CAT-162', 'Schedule D secured claims draft (CAT-162)', 'Trigger: Secured debt review completed | Fields: Creditors, collateral, lien amounts, ownership, claim status', 'pa-bk', 'Bankruptcy', 'BOTH', 'v1.0', 1, 0, '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:28:29.468', '2026-11-25 09:28:29.468'),
('d177f391-d966-4401-ad3b-94a9766fa1d0', 'CAT-064', 'Discovery verification declaration (CAT-064)', 'Trigger: Verified responses prepared | Fields: Declarant, approved response set, execution requirements', 'pa-civ', 'Civil Litigation', 'BOTH', 'v1.0', 1, 0, '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:16:26.633', '2026-11-25 09:16:26.633'),
('d29bea23-8381-48f1-8411-d42062292764', 'CAT-298', 'Possession and monetary settlement stipulation (CAT-298)', 'Trigger: Settlement terms authorized | Fields: Possession, payment, defaults, releases, performance dates', 'pa-evict', 'Landlord-Tenant', 'BOTH', 'v1.0', 1, 0, '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:45:23.110', '2026-11-25 09:45:23.110'),
('d3e2edce-2338-4c21-8831-ea964a8264f8', 'CAT-174', 'Bankruptcy signature and verification packet (CAT-174)', 'Trigger: Attorney review completed | Fields: Approved forms, declarants, signature requirements, versions', 'pa-bk', 'Bankruptcy', 'BOTH', 'v1.0', 1, 0, '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:30:03.286', '2026-11-25 09:30:03.286'),
('d421b573-609f-4cc9-b76c-064d1b241dd8', 'CAT-062', 'Production responses and objections (CAT-062)', 'Trigger: Incoming production requests assigned | Fields: Request text, responsive records, objections, production status', 'pa-civ', 'Civil Litigation', 'BOTH', 'v1.0', 1, 0, '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:16:13.582', '2026-11-25 09:16:13.582'),
('d422d311-0920-4994-a170-3056a037a137', 'CAT-030', 'Three way reconciliation report (CAT-030)', 'Trigger: Reconciliation period prepared | Fields: Adjusted bank, cash book, client ledgers, exceptions, reviewer', 'pa-civ', 'Engagement', 'BOTH', 'v1.0', 1, 1, '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:11:47.534', '2026-11-25 09:11:47.534'),
('d50331f8-1b2d-4c8f-8c58-9e05c727f6d3', 'CAT-189', 'Sponsor financial questionnaire (CAT-189)', 'Trigger: Sponsorship branch selected | Fields: Sponsor household, income, assets, taxes, supporting evidence', 'pa-imm', 'Immigration', 'BOTH', 'v1.0', 1, 0, '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:32:09.257', '2026-11-25 09:32:09.257'),
('d59580bf-04e0-4e7e-9d35-6225740cdc66', 'CAT-257', 'Custody evaluation instruction packet (CAT-257)', 'Trigger: Evaluation engagement approved | Fields: Evaluator, issues, orders, records, permissions, deliverables', 'pa-fam', 'Family Law', 'BOTH', 'v1.0', 1, 0, '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:40:22.102', '2026-11-25 09:40:22.102'),
('d600b6d6-1a87-4b1c-a1f6-63d81570b1fd', 'CAT-017', 'Substitution of counsel consent packet (CAT-017)', 'Trigger: Counsel change authorized | Fields: Outgoing and incoming counsel, client, proceeding', 'pa-civ', 'Engagement', 'BOTH', 'v1.0', 1, 1, '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:09:43.379', '2026-11-25 09:09:43.379'),
('d69ab151-17ad-49e1-8806-ce5f1fbbfbd8', 'CAT-215', 'Client declaration draft (CAT-215)', 'Trigger: Attorney requests factual declaration | Fields: Client approved facts, chronology, sources, interpreter needs', 'pa-imm', 'Immigration', 'BOTH', 'v1.0', 1, 0, '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:35:30.628', '2026-11-25 09:35:30.628'),
('d82d1e8f-307e-43f0-9e98-0589bb521c66', 'CAT-145', 'Client settlement approval and payment authorization (CAT-145)', 'Trigger: Closing figures approved by attorney | Fields: Statement version, client, distribution terms, signatures', 'pa-pi', 'Personal Injury', 'BOTH', 'v1.0', 1, 0, '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:26:37.754', '2026-11-25 09:26:37.754'),
('d90e8825-69ea-42fc-aa8a-1c53eedbbb79', 'CAT-205', 'Official Form I 751 draft (CAT-205)', 'Trigger: Conditions removal package selected | Fields: Petitioners, conditional status, filing basis, evidence', 'pa-imm', 'Immigration', 'BOTH', 'v1.0', 1, 0, '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:34:16.928', '2026-11-25 09:34:16.928'),
('d928083d-5036-40e6-ae77-1b21bb7406cb', 'CAT-141', 'Provider balance confirmation request (CAT-141)', 'Trigger: Settlement preparation activated | Fields: Provider, account, payments, adjustments, current balance', 'pa-pi', 'Personal Injury', 'BOTH', 'v1.0', 1, 0, '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:26:05.542', '2026-11-25 09:26:05.542'),
('da7e6ac8-e7f6-4fda-a381-e353c5bf361d', 'CAT-159', 'Official voluntary petition draft (CAT-159)', 'Trigger: Filing package preparation activated | Fields: Debtor data, chapter, venue facts, verified official edition', 'pa-bk', 'Bankruptcy', 'BOTH', 'v1.0', 1, 0, '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:28:12.409', '2026-11-25 09:28:12.409'),
('da9fa0f4-97ee-451f-b5c2-cdefc1326302', 'CAT-191', 'Immigration document request checklist (CAT-191)', 'Trigger: Case package selected | Fields: Participants, form package, evidence categories, missing items', 'pa-imm', 'Immigration', 'BOTH', 'v1.0', 1, 0, '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:32:26.150', '2026-11-25 09:32:26.150'),
('dae226c0-51ff-44b6-8496-952c5ab8152f', 'CAT-053', 'Motion for extension of time (CAT-053)', 'Trigger: Extension motion authorized | Fields: Deadline, grounds, consultation, requested relief', 'pa-civ', 'Civil Litigation', 'BOTH', 'v1.0', 1, 0, '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:15:11.521', '2026-11-25 09:15:11.521'),
('db721d5f-1857-4b88-a81d-1c31e3c9c7b1', 'CAT-242', 'Trust distribution request and determination (CAT-242)', 'Trigger: Distribution request submitted | Fields: Beneficiary, instrument provisions, needs, evidence, trustee decision', 'pa-prob', 'Probate', 'BOTH', 'v1.0', 1, 0, '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:38:34.336', '2026-11-25 09:38:34.336'),
('db858b5a-8b15-43ca-9670-ad16f6a562cf', 'CAT-236', 'Proposed interim distribution schedule (CAT-236)', 'Trigger: Interim distribution planning authorized | Fields: Entitlements, available funds, reserves, disputes, approvals', 'pa-prob', 'Probate', 'BOTH', 'v1.0', 1, 0, '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:37:55.738', '2026-11-25 09:37:55.738'),
('db904335-776b-4c8d-8a16-edb2795e9c4a', 'CAT-023', 'Payment receipt (CAT-023)', 'Trigger: Payment confirmed | Fields: Payer, allocation, method, operating or trust destination', 'pa-civ', 'Engagement', 'BOTH', 'v1.0', 1, 1, '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:10:37.449', '2026-11-25 09:10:37.449'),
('dc814aa3-51df-4a0e-9753-d4daadf3d1d4', 'CAT-076', 'Subpoena for testimony (CAT-076)', 'Trigger: Testimony subpoena authorized | Fields: Witness, event, location, required materials', 'pa-civ', 'Civil Litigation', 'BOTH', 'v1.0', 1, 0, '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:17:54.539', '2026-11-25 09:17:54.539'),
('dc964f6b-2777-4014-af87-fcffadd26ea7', 'CAT-284', 'Appellate docketing statement (CAT-284)', 'Trigger: Docketing task opened | Fields: Parties, issues, procedural history, record, reviewed requirements', 'pa-app', 'Appeals', 'BOTH', 'v1.0', 1, 0, '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:43:42.925', '2026-11-25 09:43:42.925'),
('dd506916-8629-420a-a3c8-f52f32c6c865', 'CAT-084', 'Opposition memorandum (CAT-084)', 'Trigger: Incoming motion assigned | Fields: Motion issues, responses, authorities, supporting evidence', 'pa-civ', 'Civil Litigation', 'BOTH', 'v1.0', 1, 0, '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:18:50.518', '2026-11-25 09:18:50.518'),
('df00076f-2d6c-4e41-a57e-dc6bcc02534a', 'CAT-126', 'Self employment income loss questionnaire (CAT-126)', 'Trigger: Self employed loss branch selected | Fields: Business, revenue periods, expenses, work limits, evidence', 'pa-pi', 'Personal Injury', 'BOTH', 'v1.0', 1, 0, '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:24:25.273', '2026-11-25 09:24:25.273'),
('df953e4a-ba2c-434d-99d3-9d5325670e1c', '115', 'Medical Records Deficiency Notice (Template 115)', 'Notice identifying missing, incomplete, or uncertified medical records from a provider.', 'pa-pi', 'Notices', 'DOCX', 'v1.0', 1, 1, '1a1c1f3c-1a81-47aa-bad3-ec5fd76b9730', '2026-11-14 09:29:54.406', '2026-11-14 09:29:54.406'),
('dfbd2a44-eaf0-49a7-97d8-728746bff4da', 'CAT-227', 'Appointment notice packet (CAT-227)', 'Trigger: Appointment notice workflow activated | Fields: Recipients, appointment, proceeding, approved notice method', 'pa-prob', 'Probate', 'BOTH', 'v1.0', 1, 0, '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:36:56.022', '2026-11-25 09:36:56.022'),
('e042cb82-7102-47ce-8273-06a55c15e9c9', 'CAT-125', 'Lost wage verification letter (CAT-125)', 'Trigger: Wage evidence request approved | Fields: Employer, work dates, earnings, restrictions, authorization', 'pa-pi', 'Personal Injury', 'BOTH', 'v1.0', 1, 0, '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:24:18.065', '2026-11-25 09:24:18.065'),
('e0ba5db5-f563-4a98-be89-0a4c8c7238b6', 'CAT-050', 'Amended complaint (CAT-050)', 'Trigger: Amendment authorized | Fields: Approved changes, operative pleading, parties, exhibits', 'pa-civ', 'Civil Litigation', 'BOTH', 'v1.0', 1, 0, '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:14:44.454', '2026-11-25 09:14:44.454'),
('e0fa7a0f-d012-4019-b761-cf1430cbe5c2', 'CAT-255', 'Support calculation worksheet (CAT-255)', 'Trigger: Support inputs approved | Fields: Income, parenting inputs, adjustments, versioned calculation method', 'pa-fam', 'Family Law', 'BOTH', 'v1.0', 1, 0, '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:40:07.667', '2026-11-25 09:40:07.667'),
('e112eab3-cb67-49aa-9e56-9d6da8c644e2', 'CAT-046', 'Answer (CAT-046)', 'Trigger: Response preparation authorized | Fields: Allegations, admissions, denials, defenses, client positions', 'pa-civ', 'Civil Litigation', 'BOTH', 'v1.0', 1, 0, '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:14:11.412', '2026-11-25 09:14:11.412'),
('e2164ecf-8858-45b0-b1f5-b49b3bfb496b', 'CAT-011', 'Client document request letter (CAT-011)', 'Trigger: Document checklist assigned | Fields: Recipient, requested items, periods, response instructions', 'pa-civ', 'Engagement', 'BOTH', 'v1.0', 1, 1, '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:08:30.402', '2026-11-25 09:08:30.402'),
('e3900301-511e-4443-9a7f-daf3b41b66f3', 'CAT-086', 'Supporting declaration and exhibit packet (CAT-086)', 'Trigger: Evidence package requested | Fields: Declarant, source facts, referenced exhibits, execution', 'pa-civ', 'Civil Litigation', 'BOTH', 'v1.0', 1, 0, '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:19:04.418', '2026-11-25 09:19:04.418'),
('e3992c43-80fc-426e-a21d-af8eb9203596', 'CAT-042', 'Summons (CAT-042)', 'Trigger: Complaint package created | Fields: Defendant, court, caption, approved official template', 'pa-civ', 'Civil Litigation', 'BOTH', 'v1.0', 1, 0, '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:13:38.494', '2026-11-25 09:13:38.494'),
('e3b64ec2-0f63-4569-96fc-0a3d243280ad', 'CAT-075', 'Subpoena for records (CAT-075)', 'Trigger: Records subpoena authorized | Fields: Recipient, scope, dates, production method, approved template', 'pa-civ', 'Civil Litigation', 'BOTH', 'v1.0', 1, 0, '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:17:48.644', '2026-11-25 09:17:48.644'),
('e3da6269-4237-4e10-b5ad-71a2de3a7152', 'CAT-258', 'Family mediation statement (CAT-258)', 'Trigger: Mediation preparation activated | Fields: Issues, parenting positions, finances, evidence, authority', 'pa-fam', 'Family Law', 'BOTH', 'v1.0', 1, 0, '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:40:28.195', '2026-11-25 09:40:28.195'),
('e529d951-a9e7-482f-b09b-dcbc494d7583', 'CAT-285', 'Opening brief and addendum draft (CAT-285)', 'Trigger: Brief preparation authorized | Fields: Issues, record citations, authorities, argument outline, exhibits', 'pa-app', 'Appeals', 'BOTH', 'v1.0', 1, 0, '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:43:52.167', '2026-11-25 09:43:52.167'),
('e8431131-abc1-46c9-ac38-97af3b31adc5', 'CAT-195', 'Official Form I 130 draft (CAT-195)', 'Trigger: Family petition package selected | Fields: Petitioner, beneficiary, relationship, history, verified edition', 'pa-imm', 'Immigration', 'BOTH', 'v1.0', 1, 0, '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:33:01.955', '2026-11-25 09:33:01.955'),
('e8789875-398d-4cfe-b84e-934d6369155a', 'CAT-078', 'Deposition notice (CAT-078)', 'Trigger: Deposition arrangements approved | Fields: Witness, date, place, method, document request', 'pa-civ', 'Civil Litigation', 'BOTH', 'v1.0', 1, 0, '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:18:08.122', '2026-11-25 09:18:08.122'),
('e884c2c4-18a5-402a-b47a-d0d72ed59d94', 'CAT-211', 'Consular application preparation worksheet (CAT-211)', 'Trigger: Consular processing path selected | Fields: Applicants, travel, family, employment, approved submission fields', 'pa-imm', 'Immigration', 'BOTH', 'v1.0', 1, 0, '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:34:59.842', '2026-11-25 09:34:59.842'),
('e90390c3-3699-4276-9c48-af213148b688', 'CAT-296', 'Tenant answer and defense preparation packet (CAT-296)', 'Trigger: Tenant response authorized | Fields: Pleadings, service, defenses, evidence, requested relief', 'pa-evict', 'Landlord-Tenant', 'BOTH', 'v1.0', 1, 0, '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:45:10.533', '2026-11-25 09:45:10.533'),
('e991fb8e-0e48-448b-a02e-58977074239f', 'CAT-085', 'Reply memorandum (CAT-085)', 'Trigger: Opposition review completed | Fields: Reply issues, authorized arguments, record references', 'pa-civ', 'Civil Litigation', 'BOTH', 'v1.0', 1, 0, '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:18:57.448', '2026-11-25 09:18:57.448'),
('ead50a5e-c335-490c-9c6c-d8940f29ed92', 'CAT-044', 'Waiver or acknowledgment of service packet (CAT-044)', 'Trigger: Attorney selects waiver route | Fields: Recipient, pleading, approved terms, return instructions', 'pa-civ', 'Civil Litigation', 'BOTH', 'v1.0', 1, 0, '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:13:55.497', '2026-11-25 09:13:55.497'),
('ebbe847a-e45b-485d-ba7c-6995642a2aca', 'CAT-093', 'Deposition designation and counterdesignation packet (CAT-093)', 'Trigger: Trial testimony selections approved | Fields: Transcript references, clips, objections, designations', 'pa-civ', 'Civil Litigation', 'BOTH', 'v1.0', 1, 0, '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:20:10.391', '2026-11-25 09:20:10.391'),
('ecba4953-1f55-4836-9aae-cbb1ae4f1c80', 'CAT-276', 'Plea and disposition document packet (CAT-276)', 'Trigger: Plea preparation authorized | Fields: Approved terms, client answers, court forms, signatures', 'pa-crim', 'Criminal Defense', 'BOTH', 'v1.0', 1, 0, '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:42:38.075', '2026-11-25 09:42:38.075'),
('ed0e3c9a-1fe1-4a4f-a741-917965b42284', 'CAT-134', 'Demand delivery and follow-up letter (CAT-134)', 'Trigger: Demand response review date reached | Fields: Approved demand, delivery evidence, recipient, response status', 'pa-pi', 'Personal Injury', 'BOTH', 'v1.0', 1, 0, '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:25:21.556', '2026-11-25 09:25:21.556'),
('edf21ab2-3e28-4ddd-afb0-81e489140627', 'CAT-077', 'Subpoena objection or protective motion (CAT-077)', 'Trigger: Subpoena challenge authorized | Fields: Service, burden, scope, objections, requested protection', 'pa-civ', 'Civil Litigation', 'BOTH', 'v1.0', 1, 0, '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:18:01.776', '2026-11-25 09:18:01.776');
INSERT INTO `document_templates` (`id`, `template_code`, `template_name`, `description`, `practice_area_id`, `category`, `output_format`, `current_version`, `is_active`, `is_system_default`, `created_by_user_id`, `created_at`, `updated_at`) VALUES
('f0f3d622-cc50-4c40-a4e8-026bb73495d9', 'CAT-082', 'Expert disclosure statement (CAT-082)', 'Trigger: Expert disclosure preparation authorized | Fields: Qualifications, opinions, reports, materials, governing requirements', 'pa-civ', 'Civil Litigation', 'BOTH', 'v1.0', 1, 0, '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:18:33.651', '2026-11-25 09:18:33.651'),
('f1abecae-695f-45bd-bcf8-979d243239a7', 'CAT-170', 'Means test official form package (CAT-170)', 'Trigger: Means test inputs approved | Fields: Applicable forms, verified inputs, current data versions, calculations', 'pa-bk', 'Bankruptcy', 'BOTH', 'v1.0', 1, 0, '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:29:24.130', '2026-11-25 09:29:24.130'),
('f2b50571-0237-47b5-bf51-cf5581e93d7b', 'CAT-225', 'Fiduciary appointment acceptance packet (CAT-225)', 'Trigger: Appointment preparation authorized | Fields: Fiduciary, proceeding, approved duties and execution requirements', 'pa-prob', 'Probate', 'BOTH', 'v1.0', 1, 0, '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:36:41.403', '2026-11-25 09:36:41.403'),
('f44eb295-2c62-4dde-a305-80510ae1496a', 'CAT-172', 'Chapter 13 feasibility report (CAT-172)', 'Trigger: Plan calculation inputs change | Fields: Income, budget, claims, payment term, calculation assumptions', 'pa-bk', 'Bankruptcy', 'BOTH', 'v1.0', 1, 0, '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:29:43.089', '2026-11-25 09:29:43.089'),
('f5d8926e-d95e-4234-a388-3b32147707a8', 'CAT-248', 'Divorce answer and counterpetition (CAT-248)', 'Trigger: Defensive response authorized | Fields: Petition allegations, positions, requested relief, parties', 'pa-fam', 'Family Law', 'BOTH', 'v1.0', 1, 0, '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:39:20.650', '2026-11-25 09:39:20.650'),
('f6f9d2da-1099-44ca-bcb8-55f582efc03c', 'CAT-297', 'Eviction hearing memorandum and exhibit index (CAT-297)', 'Trigger: Hearing preparation activated | Fields: Lease, notices, service, ledger, witnesses, disputed facts', 'pa-evict', 'Landlord-Tenant', 'BOTH', 'v1.0', 1, 0, '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:45:17.740', '2026-11-25 09:45:17.740'),
('f7287232-e24d-42da-8b7c-f75b312a6138', 'CAT-163', 'Schedule E and F claims draft (CAT-163)', 'Trigger: Unsecured debt review completed | Fields: Priority and nonpriority claims, creditors, amounts, status', 'pa-bk', 'Bankruptcy', 'BOTH', 'v1.0', 1, 0, '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:28:35.656', '2026-11-25 09:28:35.656'),
('f8990bd5-3b01-4720-9dce-fa97daab1633', 'CAT-024', 'Trust deposit acknowledgment (CAT-024)', 'Trigger: Trust receipt confirmed | Fields: Client, matter, amount, purpose, deposit status', 'pa-civ', 'Engagement', 'BOTH', 'v1.0', 1, 1, '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:10:46.357', '2026-11-25 09:10:46.357'),
('f8a9586b-9d53-4953-90d2-5a0c260a90ce', 'CAT-060', 'Requests for admission (CAT-060)', 'Trigger: Admissions request authorized | Fields: Proposed admissions, documents, responding party', 'pa-civ', 'Civil Litigation', 'BOTH', 'v1.0', 1, 0, '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:16:01.257', '2026-11-25 09:16:01.257'),
('f8ad167d-3d8a-45a7-952b-e58d87bdf917', 'CAT-120', 'Medical chronology vendor instruction letter (CAT-120)', 'Trigger: Chronology work approved | Fields: Approved source files, issues, format, due date, recipient', 'pa-pi', 'Personal Injury', 'BOTH', 'v1.0', 1, 0, '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:23:43.289', '2026-11-25 09:23:43.289'),
('f96a2000-d319-4f44-8607-a92d5cb873f9', 'CAT-040', 'Complaint (CAT-040)', 'Trigger: Filing action authorized | Fields: Parties, jurisdiction, claims, allegations, prayer, exhibits', 'pa-civ', 'Civil Litigation', 'BOTH', 'v1.0', 1, 0, '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:13:17.503', '2026-11-25 09:13:17.503'),
('fa291481-ace3-495d-83b2-d2201a034a72', 'CAT-237', 'Beneficiary receipt and release (CAT-237)', 'Trigger: Distribution terms approved | Fields: Recipient, amount or property, approved release scope, conditions', 'pa-prob', 'Probate', 'BOTH', 'v1.0', 1, 0, '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:38:02.180', '2026-11-25 09:38:02.180'),
('fa5f881b-d034-4de7-9a69-1361d964f3bf', 'CAT-069', 'Confidentiality designation notice (CAT-069)', 'Trigger: Production designations approved | Fields: Documents, designation, governing order, recipients', 'pa-civ', 'Civil Litigation', 'BOTH', 'v1.0', 1, 0, '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:16:59.935', '2026-11-25 09:16:59.935'),
('fc01163b-decd-4791-96bc-87237dc8ac62', 'CAT-147', 'Settlement performance and dismissal instructions (CAT-147)', 'Trigger: Settlement obligations recorded | Fields: Payment conditions, releases, dismissal authority, outstanding tasks', 'pa-pi', 'Personal Injury', 'BOTH', 'v1.0', 1, 0, '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:26:52.668', '2026-11-25 09:26:52.668'),
('fc1a39b3-f4d4-4967-aee7-82759812ee0a', 'CAT-132', 'Demand exhibit index (CAT-132)', 'Trigger: Demand evidence set selected | Fields: Exhibit order, files, descriptions, page ranges, versions', 'pa-pi', 'Personal Injury', 'BOTH', 'v1.0', 1, 0, '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:25:10.406', '2026-11-25 09:25:10.406'),
('fce9f466-e498-4d9f-8911-be8d217071d1', 'CAT-267', 'Notice of appearance and discovery demand (CAT-267)', 'Trigger: Representation accepted | Fields: Counsel, defendant, case, prosecutor, requested discovery', 'pa-crim', 'Criminal Defense', 'BOTH', 'v1.0', 1, 0, '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:41:29.667', '2026-11-25 09:41:29.667'),
('fceff328-15ba-4d79-a3bf-d86dd2acc00a', 'CAT-160', 'Schedule A and B draft (CAT-160)', 'Trigger: Asset records approved | Fields: Real and personal property, ownership, values, official fields', 'pa-bk', 'Bankruptcy', 'BOTH', 'v1.0', 1, 0, '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:28:17.723', '2026-11-25 09:28:17.723'),
('fd8741e6-b147-4092-b506-fce5d80b15bb', 'CAT-092', 'Witness and exhibit lists (CAT-092)', 'Trigger: Pretrial disclosure task opened | Fields: Witness records, exhibits, objections, required metadata', 'pa-civ', 'Civil Litigation', 'BOTH', 'v1.0', 1, 0, '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:20:00.458', '2026-11-25 09:20:00.458'),
('ff572cd0-e439-4d33-96cc-df2d34f691fe', 'CAT-181', 'Trustee deficiency response letter (CAT-181)', 'Trigger: Deficiency response authorized | Fields: Requested corrections, evidence, explanation, revised documents', 'pa-bk', 'Bankruptcy', 'BOTH', 'v1.0', 1, 0, '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:30:59.762', '2026-11-25 09:30:59.762'),
('ff8fa82f-2a39-4ee9-93d0-14ed3866da9e', 'CAT-193', 'Address employment and travel history worksheet (CAT-193)', 'Trigger: History collection completed | Fields: Date ranges, gaps, overlaps, travel, status, sources', 'pa-imm', 'Immigration', 'BOTH', 'v1.0', 1, 0, '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:32:44.786', '2026-11-25 09:32:44.786'),
('ff9e1bb4-a6d9-4ef7-a99d-d9b2244e7ed2', 'CAT-026', 'Expense reimbursement request (CAT-026)', 'Trigger: Reimbursement item approved | Fields: Vendor, expense, receipt, matter, payment destination', 'pa-civ', 'Engagement', 'BOTH', 'v1.0', 1, 1, '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:11:06.672', '2026-11-25 09:11:06.672'),
('fff106b1-aded-405a-ad65-04e2572ac2e9', 'CAT-124', 'Medical expense summary (CAT-124)', 'Trigger: Verified bill or payment data changes | Fields: Charges, payments, adjustments, balances, source bills', 'pa-pi', 'Personal Injury', 'BOTH', 'v1.0', 1, 0, '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:24:10.646', '2026-11-25 09:24:10.646');

-- --------------------------------------------------------

--
-- Table structure for table `document_versions`
--

CREATE TABLE `document_versions` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `document_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `version_label` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `file_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `file_type` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `file_size_bytes` bigint NOT NULL,
  `s3_storage_key` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL,
  `sha256_checksum` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `uploaded_by_user_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `revision_notes` text COLLATE utf8mb4_unicode_ci,
  `uploaded_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `evictions_cases`
--

CREATE TABLE `evictions_cases` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `matter_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `property_address` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `unit_number` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `tenant_name` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `landlord_name` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `lease_start_date` date DEFAULT NULL,
  `monthly_rent` decimal(10,2) NOT NULL,
  `outstanding_balance` decimal(10,2) NOT NULL DEFAULT '0.00',
  `notice_type` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `notice_served_date` date DEFAULT NULL,
  `summons_issued_date` date DEFAULT NULL,
  `occupancy_hearing_date` datetime(3) DEFAULT NULL,
  `writ_of_restitution_date` date DEFAULT NULL,
  `status` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Notice Phase',
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `expenses`
--

CREATE TABLE `expenses` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `expense_code` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `matter_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `incurred_by_user_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `date` date NOT NULL,
  `category` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `amount` decimal(12,2) NOT NULL,
  `vendor_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `receipt_document_id` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_billable` tinyint(1) NOT NULL DEFAULT '1',
  `status` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Unbilled',
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `family_law_cases`
--

CREATE TABLE `family_law_cases` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `matter_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `case_type` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `court_docket_number` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `marriage_date` date DEFAULT NULL,
  `separation_date` date DEFAULT NULL,
  `has_minor_children` tinyint(1) NOT NULL DEFAULT '0',
  `custody_arrangement` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `monthly_child_support` decimal(10,2) DEFAULT '0.00',
  `monthly_alimony` decimal(10,2) DEFAULT '0.00',
  `status` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Filing Pending',
  `mediation_date` datetime(3) DEFAULT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `family_law_orders`
--

CREATE TABLE `family_law_orders` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `family_law_case_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `order_title` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `order_type` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `entry_date` date DEFAULT NULL,
  `effective_date` date DEFAULT NULL,
  `signed_by_judge` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Active',
  `summary_terms` text COLLATE utf8mb4_unicode_ci,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `general_ledger_entries`
--

CREATE TABLE `general_ledger_entries` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `journal_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `account_number` int NOT NULL,
  `debit` decimal(12,2) NOT NULL DEFAULT '0.00',
  `credit` decimal(12,2) NOT NULL DEFAULT '0.00',
  `matter_id` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `general_ledger_journals`
--

CREATE TABLE `general_ledger_journals` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `journal_number` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `transaction_date` date NOT NULL,
  `memo` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_by_user_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `immigration_cases`
--

CREATE TABLE `immigration_cases` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `matter_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `visa_category` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `alien_registration_num` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `uscis_online_account_num` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `beneficiary_name` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `beneficiary_dob` date DEFAULT NULL,
  `country_of_citizenship` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `country_of_birth` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `current_immigration_status` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `class_of_admission` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `i94_number` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `priority_date` date DEFAULT NULL,
  `status` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Preparation',
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `immigration_parties`
--

CREATE TABLE `immigration_parties` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `immigration_case_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `relationship_role` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `citizenship` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `address` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_signer` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `intakes`
--

CREATE TABLE `intakes` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `intake_number` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `prospective_client` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `contact_person` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `practice_area_id` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `adverse_parties` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `matter_summary` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `dispute_amount` decimal(12,2) DEFAULT '0.00',
  `jurisdiction_venue` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `conflict_status` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Not Started',
  `reviewed_by_user_id` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `reviewed_at` datetime(3) DEFAULT NULL,
  `conflict_notes` text COLLATE utf8mb4_unicode_ci,
  `converted_to_client` tinyint(1) NOT NULL DEFAULT '0',
  `converted_client_id` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  `converted_matter_id` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `intakes`
--

INSERT INTO `intakes` (`id`, `intake_number`, `prospective_client`, `contact_person`, `email`, `phone`, `practice_area_id`, `adverse_parties`, `matter_summary`, `dispute_amount`, `jurisdiction_venue`, `conflict_status`, `reviewed_by_user_id`, `reviewed_at`, `conflict_notes`, `converted_to_client`, `converted_client_id`, `created_at`, `updated_at`, `converted_matter_id`) VALUES
('a599c7c8-3ef7-4960-a38d-32eecf00fc08', 'INT-26-0001', 'david john', 'david', 'davide@gmail.com', '2344565632', 'pa-fam', 'thomas', 'divorce.......', 75000.00, 'Utah Third Judicial District Court (Salt Lake County)', 'Cleared', '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-16 11:15:14.622', 'Zero adverse party or prior representation conflicts identified across active rosters, closed files, and corporate affiliates for query \"thomas\". Cleared under Utah RPC 1.7.', 0, NULL, '2026-11-16 11:14:47.268', '2026-11-16 11:15:14.623', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `invoices`
--

CREATE TABLE `invoices` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `invoice_number` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `client_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `matter_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `issue_date` date NOT NULL,
  `due_date` date NOT NULL,
  `total_amount` decimal(12,2) NOT NULL,
  `paid_amount` decimal(12,2) NOT NULL DEFAULT '0.00',
  `balance_due` decimal(12,2) NOT NULL,
  `status` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Draft',
  `sent_at` datetime(3) DEFAULT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `invoice_line_items`
--

CREATE TABLE `invoice_line_items` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `invoice_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `item_type` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `time_entry_id` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `expense_id` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `quantity` decimal(5,2) NOT NULL,
  `unit_rate` decimal(10,2) NOT NULL,
  `total_price` decimal(12,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `litigation_cases`
--

CREATE TABLE `litigation_cases` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `matter_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `court_jurisdiction` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `court_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `case_docket_number` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `presiding_judge` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `jury_demand` tinyint(1) NOT NULL DEFAULT '0',
  `litigation_stage` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Pre-Filing',
  `filing_date` date DEFAULT NULL,
  `trial_date` date DEFAULT NULL,
  `discovery_cutoff_date` date DEFAULT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `matters`
--

CREATE TABLE `matters` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `matter_number` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `client_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `practice_area_id` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `current_stage_id` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Active',
  `responsible_attorney_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `billing_type` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `hourly_rate` decimal(10,2) DEFAULT NULL,
  `flat_fee_amount` decimal(12,2) DEFAULT NULL,
  `contingency_percentage` decimal(5,2) DEFAULT NULL,
  `budget` decimal(12,2) NOT NULL DEFAULT '0.00',
  `open_date` date NOT NULL,
  `close_date` date DEFAULT NULL,
  `statute_of_limitations` date DEFAULT NULL,
  `next_court_date` datetime(3) DEFAULT NULL,
  `court_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `judge` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `case_docket_number` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `matters`
--

INSERT INTO `matters` (`id`, `matter_number`, `client_id`, `title`, `practice_area_id`, `current_stage_id`, `status`, `responsible_attorney_id`, `billing_type`, `hourly_rate`, `flat_fee_amount`, `contingency_percentage`, `budget`, `open_date`, `close_date`, `statute_of_limitations`, `next_court_date`, `court_name`, `judge`, `case_docket_number`, `description`, `created_at`, `updated_at`) VALUES
('fdefc7e3-861c-4838-a38a-f580b6c59e8b', '26-FAM-0101', 'b23414a1-b309-44c9-8097-bb3fc368222d', 'david john v. thomas', 'pa-fam', NULL, 'Active', '8640f71a-0142-42f4-a4c0-732537dcd9b7', 'Hourly', 4500.00, NULL, NULL, 30000.00, '2026-11-16', NULL, '2026-11-24', '2026-11-26 00:00:00.000', 'abc', 'Hon. Elizabeth A. Hruby-Mills', NULL, 'divorce.......', '2026-11-16 11:18:48.650', '2026-11-16 11:37:21.166');

-- --------------------------------------------------------

--
-- Table structure for table `matter_staff_assignments`
--

CREATE TABLE `matter_staff_assignments` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `matter_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `assignment_role` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `assigned_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `matter_staff_assignments`
--

INSERT INTO `matter_staff_assignments` (`id`, `matter_id`, `user_id`, `assignment_role`, `assigned_at`) VALUES
('2beab98f-41dc-48de-a808-e11dcc1bb3b9', 'fdefc7e3-861c-4838-a38a-f580b6c59e8b', 'b4144e13-e1b8-4c10-bc62-3ca0966380e0', 'paralegal', '2026-11-16 11:18:48.661');

-- --------------------------------------------------------

--
-- Table structure for table `matter_stage_histories`
--

CREATE TABLE `matter_stage_histories` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `matter_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `from_stage_id` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `to_stage_id` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `transitioned_by_user_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `verified_gatekeepers` json NOT NULL,
  `transitioned_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
) ;

-- --------------------------------------------------------

--
-- Table structure for table `payment_records`
--

CREATE TABLE `payment_records` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `payment_reference` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `invoice_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `client_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `amount` decimal(12,2) NOT NULL,
  `payment_method` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `destination_account` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `transaction_reference` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `received_date` date NOT NULL,
  `recorded_by_user_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `pi_damages_records`
--

CREATE TABLE `pi_damages_records` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `matter_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `injury_category` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `anatomical_location` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `severity_grade` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `icd_code` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `future_treatment_projected` tinyint(1) NOT NULL DEFAULT '0',
  `future_medical_estimated_cost` decimal(12,2) NOT NULL DEFAULT '0.00',
  `treatment_summary` text COLLATE utf8mb4_unicode_ci,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `pi_demand_packages`
--

CREATE TABLE `pi_demand_packages` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `matter_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `insurance_policy_id` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `draft_document_id` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `approved_by_attorney_id` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `demand_title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `recipient_carrier` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `claim_number` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `demanded_amount` decimal(12,2) NOT NULL,
  `policy_limit_amount` decimal(12,2) DEFAULT NULL,
  `is_policy_limit_demand` tinyint(1) NOT NULL DEFAULT '0',
  `status` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'DRAFTING',
  `sent_date` date DEFAULT NULL,
  `deadline_date` date NOT NULL,
  `response_received_date` date DEFAULT NULL,
  `checklist_state` json DEFAULT NULL,
  `counter_offer_amount` decimal(12,2) DEFAULT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `pi_diagnostic_studies`
--

CREATE TABLE `pi_diagnostic_studies` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `matter_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `damages_record_id` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `imaging_report_document_id` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `study_type` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `body_region` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `study_date` date NOT NULL,
  `facility_name` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `radiologist_impression` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_positive_finding` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `pi_incidents`
--

CREATE TABLE `pi_incidents` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `matter_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `incident_date` date DEFAULT NULL,
  `incident_time` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `incident_location` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `accident_type` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `police_agency` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `report_number` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `investigating_officer` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `liability_assessment` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `plaintiff_fault_percentage` decimal(5,2) DEFAULT NULL,
  `adverse_fault_percentage` decimal(5,2) DEFAULT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `pi_incidents`
--

INSERT INTO `pi_incidents` (`id`, `matter_id`, `incident_date`, `incident_time`, `incident_location`, `accident_type`, `description`, `police_agency`, `report_number`, `investigating_officer`, `liability_assessment`, `plaintiff_fault_percentage`, `adverse_fault_percentage`, `notes`, `created_at`, `updated_at`) VALUES
('2acccd8d-8e3c-4886-8c83-d758968987d9', 'e48c1f1e-1024-44c9-9626-07daeb576323', NULL, NULL, NULL, 'Motor Vehicle Collision', 'ertfsdf', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-11-16 08:57:24.621', '2026-11-16 08:57:24.621'),
('2bb18bf6-ba6f-48d5-999d-4eae0c43cf67', '55a98cb1-3351-4785-8045-7c75b24b3875', NULL, NULL, NULL, 'Motor Vehicle Collision', 'accident........', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-11-16 08:37:53.861', '2026-11-16 08:37:53.861'),
('3f31d2d4-c520-4421-9ede-a2fc21768f25', '8043264c-009c-4a7b-8a84-c4d68d2ef915', NULL, NULL, NULL, 'Motor Vehicle Collision', 'ertfsdf', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-11-16 08:57:23.546', '2026-11-16 08:57:23.546'),
('8c7cb5db-cbe5-460d-b0e5-ea1b9b89fba4', '09f039af-ab7f-446d-af58-0e4c547c0b09', NULL, NULL, NULL, 'Motor Vehicle Collision', 'ertfsdf', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-11-16 08:57:32.977', '2026-11-16 08:57:32.977'),
('8d767445-b477-472d-b75a-8b82b0b4ef5d', 'ed492d67-cedc-4742-a087-0d38f973270e', NULL, NULL, NULL, 'Motor Vehicle Collision', 'accident........', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-11-16 08:37:51.320', '2026-11-16 08:37:51.320'),
('d96d0177-0a74-45fb-aec6-955e5e24859f', 'bcaa03f5-dd52-459d-b034-8b367fb7c7a4', NULL, NULL, NULL, 'Motor Vehicle Collision', 'ertfsdf', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-11-16 08:57:21.908', '2026-11-16 08:57:21.908'),
('f2576a04-ed87-48bf-9038-792b06153abb', 'd05f5122-e90e-4bd5-9f75-ed8036926844', NULL, NULL, NULL, 'Motor Vehicle Collision', 'accident........', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-11-16 08:37:57.145', '2026-11-16 08:37:57.145');

-- --------------------------------------------------------

--
-- Table structure for table `pi_incident_parties`
--

CREATE TABLE `pi_incident_parties` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `incident_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `party_type` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `full_name` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `insurance_carrier` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `policy_number` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `claim_number` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `vehicle_make` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `vehicle_model` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `vehicle_year` int DEFAULT NULL,
  `vehicle_plate` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `vehicle_state` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `citations_issued` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `admitted_fault` tinyint(1) NOT NULL DEFAULT '0',
  `fault_percentage` decimal(5,2) DEFAULT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `pi_insurance_policies`
--

CREATE TABLE `pi_insurance_policies` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `matter_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `incident_id` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `coverage_type` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `insurance_company` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `policy_number` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `claim_number` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `adjuster_name` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `adjuster_phone` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `adjuster_email` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `adjuster_fax` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `insured_name` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `policy_limits` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Active',
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `pi_liens`
--

CREATE TABLE `pi_liens` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `matter_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `provider_id` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `lienholder_name` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `category` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `account_reference` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `asserted_amount` decimal(12,2) NOT NULL,
  `verified_amount` decimal(12,2) NOT NULL DEFAULT '0.00',
  `negotiated_amount` decimal(12,2) NOT NULL DEFAULT '0.00',
  `common_fund_reduction_rate` decimal(5,2) DEFAULT NULL,
  `procurement_cost_deduction` decimal(12,2) NOT NULL DEFAULT '0.00',
  `final_payoff_amount` decimal(12,2) NOT NULL DEFAULT '0.00',
  `status` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'ASSERTED',
  `final_payoff_letter_document_id` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_erisa_qualified` tinyint(1) NOT NULL DEFAULT '0',
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `pi_lien_negotiations`
--

CREATE TABLE `pi_lien_negotiations` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `lien_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `conducted_by_user_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `negotiation_date` date NOT NULL,
  `offered_amount` decimal(12,2) NOT NULL,
  `response_amount` decimal(12,2) DEFAULT NULL,
  `outcome` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `pi_medical_billing_summaries`
--

CREATE TABLE `pi_medical_billing_summaries` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `matter_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `provider_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `account_number` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'PRIMARY',
  `service_category` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `total_billed` decimal(12,2) NOT NULL DEFAULT '0.00',
  `cached_balance_owed` decimal(12,2) NOT NULL DEFAULT '0.00',
  `billing_ledger_document_id` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `treatment_status` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'ACTIVE',
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `pi_medical_payment_records`
--

CREATE TABLE `pi_medical_payment_records` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `billing_summary_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `transaction_type` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `payment_source` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `amount` decimal(12,2) NOT NULL,
  `payment_date` date NOT NULL,
  `check_or_reference_number` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `eob_document_id` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `reversal_of_record_id` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `reason_notes` text COLLATE utf8mb4_unicode_ci,
  `created_by_user_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `pi_medical_providers`
--

CREATE TABLE `pi_medical_providers` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `matter_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `provider_name` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `provider_type` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `facility_address` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `fax` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `treatment_start_date` date DEFAULT NULL,
  `treatment_end_date` date DEFAULT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `pi_medical_record_requests`
--

CREATE TABLE `pi_medical_record_requests` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `matter_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `provider_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `request_code` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Drafted',
  `authorization_signed` tinyint(1) NOT NULL DEFAULT '0',
  `authorization_date` date DEFAULT NULL,
  `authorization_document_id` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `request_document_id` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `request_sent_date` date DEFAULT NULL,
  `request_due_date` date DEFAULT NULL,
  `records_received_date` date DEFAULT NULL,
  `is_complete` tinyint(1) NOT NULL DEFAULT '0',
  `deficiency_notes` text COLLATE utf8mb4_unicode_ci,
  `follow_up_document_id` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `follow_up_sent_date` date DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `pi_settlement_disbursements`
--

CREATE TABLE `pi_settlement_disbursements` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `matter_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `settlement_title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `current_version_number` int NOT NULL DEFAULT '1',
  `status` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'DRAFT',
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `pi_settlement_disbursement_versions`
--

CREATE TABLE `pi_settlement_disbursement_versions` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `settlement_disbursement_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `version_number` int NOT NULL,
  `gross_settlement_amount` decimal(12,2) NOT NULL,
  `contingency_fee_percentage` decimal(5,2) NOT NULL,
  `calculated_attorney_fee` decimal(12,2) NOT NULL,
  `total_litigation_costs` decimal(12,2) NOT NULL,
  `total_client_advances` decimal(12,2) NOT NULL DEFAULT '0.00',
  `total_medical_liens` decimal(12,2) NOT NULL,
  `other_deductions` decimal(12,2) NOT NULL DEFAULT '0.00',
  `net_client_recovery` decimal(12,2) NOT NULL,
  `version_status` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'DRAFT',
  `is_immutable` tinyint(1) NOT NULL DEFAULT '0',
  `signed_closing_statement_doc_id` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `client_approval_date` date DEFAULT NULL,
  `client_approval_evidence` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `approved_by_attorney_id` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `approved_at` datetime(3) DEFAULT NULL,
  `created_by_user_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Triggers `pi_settlement_disbursement_versions`
--
DELIMITER $$
CREATE TRIGGER `trg_prevent_immutable_settlement_delete` BEFORE DELETE ON `pi_settlement_disbursement_versions` FOR EACH ROW BEGIN
             IF OLD.is_immutable = 1 THEN
                 SIGNAL SQLSTATE '45000'
                 SET MESSAGE_TEXT = 'Audit Violation: Finalized settlement versions cannot be deleted.';
             END IF;
         END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `trg_prevent_immutable_settlement_update` BEFORE UPDATE ON `pi_settlement_disbursement_versions` FOR EACH ROW BEGIN
             IF OLD.is_immutable = 1 THEN
                 SIGNAL SQLSTATE '45000'
                 SET MESSAGE_TEXT = 'Execution Blocked: Settlement version is finalized and immutable. Modifications are prohibited.';
             END IF;
         END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `pi_settlement_executions`
--

CREATE TABLE `pi_settlement_executions` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `settlement_version_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `trust_sub_ledger_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `idempotency_key` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `executed_by_user_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `executed_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Triggers `pi_settlement_executions`
--
DELIMITER $$
CREATE TRIGGER `trg_verify_settlement_matter_subledger` BEFORE INSERT ON `pi_settlement_executions` FOR EACH ROW BEGIN
             DECLARE v_settlement_matter_id VARCHAR(36);
             DECLARE v_subledger_matter_id VARCHAR(36);

             SELECT d.matter_id INTO v_settlement_matter_id
             FROM pi_settlement_disbursement_versions v
             JOIN pi_settlement_disbursements d ON v.settlement_disbursement_id = d.id
             WHERE v.id = NEW.settlement_version_id
             LIMIT 1;

             SELECT s.matter_id INTO v_subledger_matter_id
             FROM trust_sub_ledgers s
             WHERE s.id = NEW.trust_sub_ledger_id
             LIMIT 1;

             IF v_settlement_matter_id IS NULL OR v_subledger_matter_id IS NULL OR v_settlement_matter_id <> v_subledger_matter_id THEN
                 SIGNAL SQLSTATE '45000'
                 SET MESSAGE_TEXT = 'Integrity Violation: TrustSubLedger matter does not match Settlement Disbursement matter.';
             END IF;
         END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `pi_settlement_execution_lines`
--

CREATE TABLE `pi_settlement_execution_lines` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `settlement_execution_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `trust_sub_ledger_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `trust_transaction_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `disbursement_role` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `line_identifier` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `lien_id` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `amount` decimal(12,2) NOT NULL,
  `payee_name` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `pi_vendors`
--

CREATE TABLE `pi_vendors` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `vendor_name` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `category` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `contact_person` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `hourly_rate` decimal(10,2) DEFAULT NULL,
  `tax_id` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `pi_vendor_assignments`
--

CREATE TABLE `pi_vendor_assignments` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `matter_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `vendor_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `assigned_staff_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `expense_id` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `service_scope` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'ASSIGNED',
  `assigned_date` date NOT NULL,
  `due_date` date DEFAULT NULL,
  `authorized_amount` decimal(12,2) NOT NULL DEFAULT '0.00',
  `invoiced_amount` decimal(12,2) NOT NULL DEFAULT '0.00',
  `report_document_id` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `pi_wage_loss_records`
--

CREATE TABLE `pi_wage_loss_records` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `matter_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `verification_document_id` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `employer_name` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `job_title` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `pay_rate_type` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'HOURLY',
  `base_pay_rate` decimal(10,2) NOT NULL,
  `hours_lost` decimal(8,2) DEFAULT NULL,
  `days_lost` int DEFAULT NULL,
  `start_date` date NOT NULL,
  `end_date` date DEFAULT NULL,
  `total_lost_wages` decimal(12,2) NOT NULL,
  `is_verified_by_employer` tinyint(1) NOT NULL DEFAULT '0',
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `pleadings_records`
--

CREATE TABLE `pleadings_records` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `litigation_case_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `pleading_type` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `filing_party` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `filed_date` date DEFAULT NULL,
  `response_due_date` date DEFAULT NULL,
  `status` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Draft',
  `ecf_docket_number` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `practice_areas`
--

CREATE TABLE `practice_areas` (
  `id` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `code` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL,
  `brand_color` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `practice_areas`
--

INSERT INTO `practice_areas` (`id`, `name`, `code`, `brand_color`, `is_active`) VALUES
('pa-app', 'Appeals', 'APP', '#4f46e5', 1),
('pa-bk', 'Bankruptcy', 'BK', '#0284c7', 1),
('pa-civ', 'Civil/Commercial Litigation', 'CIV', '#2563eb', 1),
('pa-crim', 'Criminal Defense', 'CRIM', '#ef4444', 1),
('pa-evict', 'Landlord-Tenant/Evictions', 'EVICT', '#d97706', 1),
('pa-fam', 'Family Law', 'FAM', '#ec4899', 1),
('pa-imm', 'Immigration', 'IMM', '#059669', 1),
('pa-pi', 'Personal Injury', 'PI', '#ea580c', 1),
('pa-prob', 'Probate', 'PROB', '#8b5cf6', 1);

-- --------------------------------------------------------

--
-- Table structure for table `probate_assets`
--

CREATE TABLE `probate_assets` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `probate_case_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `asset_type` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `estimated_value` decimal(12,2) NOT NULL,
  `appraisal_value` decimal(12,2) DEFAULT NULL,
  `is_disposed` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `probate_beneficiaries`
--

CREATE TABLE `probate_beneficiaries` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `probate_case_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `relationship` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `share_percent` decimal(5,2) DEFAULT NULL,
  `specific_gift` text COLLATE utf8mb4_unicode_ci,
  `is_notice_sent` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `probate_cases`
--

CREATE TABLE `probate_cases` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `matter_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `decedent_name` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `date_of_death` date NOT NULL,
  `county_jurisdiction` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT 'Salt Lake County',
  `court_case_number` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `probate_type` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Informal Probate',
  `has_will` tinyint(1) NOT NULL DEFAULT '1',
  `personal_rep_name` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `personal_rep_role` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT 'Executor',
  `inventory_value` decimal(12,2) DEFAULT '0.00',
  `status` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Opened',
  `notice_deadline` date DEFAULT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `roles`
--

CREATE TABLE `roles` (
  `id` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `roles`
--

INSERT INTO `roles` (`id`, `name`, `description`, `created_at`) VALUES
('attorney', 'Attorney', 'Case file management, litigation dockets, client advisory, time logging, and personal workload.', '2026-11-13 07:39:36.862'),
('billing', 'Billing / Accounting Staff', 'Invoicing, disbursements, fee accounting, receivables, and official CosmoLex ledger synchronization.', '2026-11-13 07:39:36.868'),
('paralegal', 'Paralegal / Staff', 'Litigation support, court filings, document repository management, and task checklists.', '2026-11-13 07:39:36.866'),
('super_admin', 'Super Admin', 'Full administrative control, user governance, security policies, and firm-wide ledger visibility.', '2026-11-13 07:39:36.856'),
('supervisor', 'Supervisor', 'Cross-matter oversight, department workload balancing, and partner time-entry approval queues.', '2026-11-13 07:39:36.870');

-- --------------------------------------------------------

--
-- Table structure for table `role_permissions`
--

CREATE TABLE `role_permissions` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `role_id` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `permission_key` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `granted_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `role_permissions`
--

INSERT INTO `role_permissions` (`id`, `role_id`, `permission_key`, `granted_at`) VALUES
('005c92fd-f6b0-4c22-bd3f-523fadeb9c1d', 'super_admin', 'matters:view', '2026-11-13 07:39:36.914'),
('02f3adf3-46bc-426f-9d99-936da2e7294c', 'super_admin', 'operating:view', '2026-11-13 07:39:37.004'),
('037d1662-84d3-4c3e-b385-43a1e75a31c3', 'super_admin', 'expenses:view', '2026-11-13 07:39:36.980'),
('05a44d2a-5814-4ce1-930e-dff40f237e73', 'super_admin', 'calendar:view', '2026-11-13 07:39:36.953'),
('070983f4-11f3-4235-b6c8-289f5bfe5671', 'supervisor', 'deadlines:view', '2026-11-13 07:39:37.373'),
('071e6522-1306-4ca1-bee0-5b1137b8f1d4', 'super_admin', 'matters:delete', '2026-11-13 07:39:36.920'),
('08d10416-0463-41b1-840b-126cd463a9d0', 'super_admin', 'communications:manage', '2026-11-13 07:39:36.937'),
('0a3878ce-4f96-4850-9e5c-6ddea2dbbfae', 'attorney', 'clients:create', '2026-11-13 07:39:37.073'),
('0a9501b6-29be-4428-a6bd-dbe5ee3743b7', 'billing', 'billing:reports_view', '2026-11-13 07:39:37.297'),
('0dc376e7-7074-472e-8125-924de79e2aa3', 'supervisor', 'documents:view', '2026-11-13 07:39:37.348'),
('0e73fe49-7251-4269-a5c8-753dc7220d2c', 'super_admin', 'cosmolex:view', '2026-11-13 07:39:37.009'),
('0fbd0175-1af2-4898-8bf5-50a1601a75f6', 'paralegal', 'matters:view', '2026-11-13 07:39:37.173'),
('1146ec99-bf63-4e3b-8fb6-faf14c7d71b4', 'supervisor', 'time:review_own', '2026-11-13 07:39:37.377'),
('1a68c2d3-3f78-459a-8df5-effed8dab155', 'super_admin', 'deadlines:view', '2026-11-13 07:39:36.955'),
('1d582f9c-2141-47a2-a097-a3da54480c87', 'supervisor', 'time:review_team', '2026-11-13 07:39:37.380'),
('1f1deb36-5abc-4a63-813a-5c58f3c3f2d6', 'billing', 'billing:hours_view', '2026-11-13 07:39:37.272'),
('1f636074-eb96-42ef-a2e1-fee72b9f9d20', 'supervisor', 'notifications:manage', '2026-11-13 07:39:37.425'),
('209f6139-23e1-41e9-93e6-fdb3078602ce', 'billing', 'matters:view', '2026-11-13 07:39:37.252'),
('20f71b65-f04a-430c-834f-3b334e8b0e53', 'billing', 'notifications:manage', '2026-11-13 07:39:37.315'),
('21054aa4-f913-4ecd-9038-2d9eccd07523', 'paralegal', 'time:log', '2026-11-13 07:39:37.217'),
('21f0e5c9-2562-4f90-80d7-fb7461f4d33f', 'supervisor', 'time:reject', '2026-11-13 07:39:37.386'),
('235706a4-dcc5-4bdf-b61b-52e6d7f00ee4', 'super_admin', 'clients:delete', '2026-11-13 07:39:36.911'),
('25d34bd0-7132-4aab-8053-3683ee638a23', 'supervisor', 'templates:view', '2026-11-13 07:39:37.420'),
('26cea092-4247-4b67-9bec-9621cba7876b', 'paralegal', 'communications:manage', '2026-11-13 07:39:37.191'),
('2845b3ba-3b1a-4db4-83a2-f3149867c28a', 'paralegal', 'checklists:manage', '2026-11-13 07:39:37.230'),
('2863b860-ff53-4b98-8b13-52cebc05a2e2', 'super_admin', 'tasks:delete', '2026-11-13 07:39:36.951'),
('29d00561-f5c8-4d2e-8c2e-08cc37fd5f5c', 'paralegal', 'dashboard:view', '2026-11-13 07:39:37.167'),
('2a92b607-9397-4caf-85ca-9fe779ecdc72', 'attorney', 'reports:staff_view', '2026-11-13 07:39:37.155'),
('2dd9b43b-7d3e-48f7-849d-e45366403436', 'billing', 'clients:view', '2026-11-13 07:39:37.249'),
('2ee41a6c-0aa5-4820-b193-da73b02bde16', 'super_admin', 'branding:manage', '2026-11-13 07:39:37.052'),
('2f4c00ca-bdc0-4312-9c2d-880aded4dcf5', 'attorney', 'documents:view', '2026-11-13 07:39:37.096'),
('2f5a52bc-54c2-4d3e-be1d-58aeb3aa69c8', 'supervisor', 'communications:view', '2026-11-13 07:39:37.353'),
('30444d98-294d-4ccb-848c-6d9baccc07f7', 'paralegal', 'deadlines:view', '2026-11-13 07:39:37.213'),
('30dcd7de-fc30-4d2e-809f-d30cbc36b07c', 'super_admin', 'dashboard:approvals_view', '2026-11-13 07:39:36.903'),
('3139e58c-6b6b-4236-8c14-760309ae8679', 'super_admin', 'users:manage', '2026-11-13 07:39:37.026'),
('31a0884d-69ad-49ba-833f-081dd2235a7f', 'billing', 'cosmolex:export', '2026-11-13 07:39:37.307'),
('3261ab5b-c72f-4a1b-8ce0-8837de7329e8', 'attorney', 'calendar:view', '2026-11-13 07:39:37.122'),
('32ddac8d-ca3e-44a9-ae5f-48900001a0dc', 'paralegal', 'documents:view', '2026-11-13 07:39:37.183'),
('3305c1c8-c884-4884-9e8a-92ea3e7a2b87', 'attorney', 'tasks:view_team', '2026-11-13 07:39:37.115'),
('33c495de-c295-466f-b3a7-c48f88ec2a41', 'attorney', 'matters:create', '2026-11-13 07:39:37.081'),
('3558df8c-b941-4c69-9e02-8d2d10b421fd', 'super_admin', 'integrations:manage', '2026-11-13 07:39:37.049'),
('378b1d13-db3a-4621-b3ca-8c78582ce206', 'supervisor', 'tasks:view_own', '2026-11-13 07:39:37.361'),
('3b59a7fa-371f-4c33-9260-674b14730b34', 'paralegal', 'expenses:create', '2026-11-13 07:39:37.236'),
('3f405b33-c14a-46c6-82e6-ca2b6e8c3247', 'billing', 'billing:overview_view', '2026-11-13 07:39:37.269'),
('40298537-06fa-4f1f-95a5-737fbc4d6847', 'supervisor', 'time:suggested_view', '2026-11-13 07:39:37.383'),
('404bb7d1-fc8b-494c-9e59-3d4b2baacf7e', 'super_admin', 'templates:manage', '2026-11-13 07:39:37.037'),
('409bafa5-538a-4ec9-9da4-7d78f9c49ed2', 'attorney', 'clients:view', '2026-11-13 07:39:37.070'),
('40f42a9c-3223-4496-9d67-00f4e187335c', 'super_admin', 'time:approve', '2026-11-13 07:39:36.966'),
('41207bd5-ebf0-4438-9f2c-e60fbff53405', 'billing', 'reports:export', '2026-11-13 07:39:37.312'),
('4132227f-0631-440c-a84f-4170dc9fd57f', 'super_admin', 'tasks:view_own', '2026-11-13 07:39:36.942'),
('420241b6-11e0-4e7d-9028-fad459d5e8ea', 'attorney', 'dashboard:workload_view', '2026-11-13 07:39:37.067'),
('4243dfd9-b7ac-40b8-9c1f-534598d00636', 'attorney', 'reports:matter_view', '2026-11-13 07:39:37.158'),
('444c0ca3-c029-4b4c-bbb7-48dfd1d1fe10', 'super_admin', 'time:suggested_view', '2026-11-13 07:39:36.964'),
('448627af-1593-44a5-8b01-301d01387d60', 'super_admin', 'dashboard:view', '2026-11-13 07:39:36.897'),
('4556bbd0-5432-4172-b5fe-83154b09bb52', 'super_admin', 'tasks:edit', '2026-11-13 07:39:36.949'),
('47f4d686-97af-487f-a37f-6a55ef584f6c', 'super_admin', 'checklists:manage', '2026-11-13 07:39:36.973'),
('4829107f-8c3f-4f1c-929e-025b65409d9b', 'attorney', 'expenses:create', '2026-11-13 07:39:37.152'),
('48f65d03-5ca9-4566-a3ac-666ce4b98855', 'attorney', 'clients:edit', '2026-11-13 07:39:37.076'),
('4b959c82-f6da-4948-9471-a292ff3cdea7', 'supervisor', 'time:approve', '2026-11-13 07:39:37.384'),
('4c26d77b-ede3-4222-b73c-d99a5441c624', 'super_admin', 'dashboard:workload_view', '2026-11-13 07:39:36.901'),
('4ca73a3b-d334-4557-a48e-25b419f74c11', 'super_admin', 'documents:upload', '2026-11-13 07:39:36.931'),
('4ebf61a2-5a4d-4570-8e52-b78d3cfeb892', 'paralegal', 'templates:view', '2026-11-13 07:39:37.239'),
('4ed201e2-ac9c-44e4-bcb2-bff9b6b79ab2', 'super_admin', 'payments:view', '2026-11-13 07:39:36.996'),
('4f124ed1-5d11-4fd6-961e-34b6448853c6', 'supervisor', 'matters:view', '2026-11-13 07:39:37.332'),
('4f824143-cf91-4aec-bd2a-cf1f02318647', 'super_admin', 'trust:view', '2026-11-13 07:39:37.006'),
('4fa3b7cf-1c87-4d0a-8f4c-49bff6b6d168', 'attorney', 'intake:view', '2026-11-13 07:39:37.087'),
('5019f5ca-2e3d-4a7c-b3a9-4bc9ff7a329b', 'supervisor', 'matters:create', '2026-11-13 07:39:37.335'),
('523adb25-b675-493e-ad63-9b2b158b9347', 'super_admin', 'clients:create', '2026-11-13 07:39:36.907'),
('525a016c-5da9-41a3-ba43-cb9c438b3e3f', 'supervisor', 'portal:preview', '2026-11-13 07:39:37.358'),
('5328b0b9-60b1-4baa-8f2f-98726758da99', 'paralegal', 'calendar:view', '2026-11-13 07:39:37.211'),
('560d0193-cef1-4094-821b-cbf74349b280', 'paralegal', 'tasks:view_team', '2026-11-13 07:39:37.203'),
('560ee21f-4b6d-4c0d-9f80-455b7c624a4e', 'supervisor', 'billing:overview_view', '2026-11-13 07:39:37.392'),
('56746df7-6c83-4dc5-91c8-3b707075a039', 'supervisor', 'dashboard:workload_view', '2026-11-13 07:39:37.319'),
('567b4598-cc08-4268-ae2c-19159e79d6a5', 'supervisor', 'checklists:manage', '2026-11-13 07:39:37.390'),
('593d752e-9337-4649-8f9b-b2fd2b251978', 'attorney', 'expenses:view', '2026-11-13 07:39:37.150'),
('5af6a2a3-60a1-4031-8dc4-ad56c588bfa7', 'super_admin', 'matters:create', '2026-11-13 07:39:36.916'),
('5b01025e-0784-41f2-a4cc-6287f1d1d076', 'billing', 'invoices:view', '2026-11-13 07:39:37.283'),
('5bca675a-4e8f-4332-8108-4bfc1523b2d9', 'attorney', 'checklists:view', '2026-11-13 07:39:37.137'),
('5d7374a5-990f-488f-951b-3fd6b6dac01a', 'super_admin', 'payments:record', '2026-11-13 07:39:36.999'),
('5ff7e463-037a-4c46-bcc3-097aaf339ceb', 'super_admin', 'notifications:manage', '2026-11-13 07:39:37.055'),
('60f06f72-71e9-4784-9fd7-9a148df7c2b4', 'attorney', 'communications:manage', '2026-11-13 07:39:37.106'),
('6284b5e6-7696-45b9-8982-8ea7f0896ab5', 'supervisor', 'expenses:view', '2026-11-13 07:39:37.407'),
('64c9baf8-9ba3-472b-a4e7-d087906f1aaa', 'super_admin', 'billing:hours_view', '2026-11-13 07:39:36.977'),
('6605653b-3909-47b1-8be9-27994d6f705e', 'paralegal', 'tasks:create', '2026-11-13 07:39:37.205'),
('665deed5-a098-48e7-875b-d934de8bb422', 'super_admin', 'security:manage', '2026-11-13 07:39:37.061'),
('667a0bd8-3f91-4a73-9dba-42e9f05beed4', 'attorney', 'time:review_own', '2026-11-13 07:39:37.131'),
('69d5bb21-a53b-47cd-b6b6-1aa845278168', 'supervisor', 'billing:hours_view', '2026-11-13 07:39:37.404'),
('6a0f4cce-d99e-498b-a2c8-9a026aa91de4', 'attorney', 'intake:conflict_review', '2026-11-13 07:39:37.093'),
('6a8a3b6b-1e41-4f55-bf76-46efd79a315f', 'billing', 'payments:view', '2026-11-13 07:39:37.291'),
('6b38c9d9-2188-4379-8026-14b26b747b6a', 'super_admin', 'portal:preview', '2026-11-13 07:39:36.940'),
('6bb0cd63-a4ea-4d0a-8761-33a91b5cca75', 'super_admin', 'time:review_own', '2026-11-13 07:39:36.959'),
('6c211e40-3613-471e-b96c-3c62cdd56673', 'billing', 'dashboard:view', '2026-11-13 07:39:37.246'),
('6f07726a-2071-460e-94f5-ef22085a9527', 'paralegal', 'expenses:view', '2026-11-13 07:39:37.233'),
('700ae968-9ed0-4962-a6cb-055e059f722b', 'supervisor', 'clients:edit', '2026-11-13 07:39:37.329'),
('73b56302-4e08-4daf-9a56-7ae0b37a9c9f', 'supervisor', 'calendar:view', '2026-11-13 07:39:37.371'),
('74b2bfa1-c591-4dd8-a8b4-4904b7a0dd01', 'attorney', 'intake:create', '2026-11-13 07:39:37.090'),
('77207133-9dfb-49b6-adda-2a6583e5ddcf', 'paralegal', 'tasks:edit', '2026-11-13 07:39:37.208'),
('77c58a3e-cf97-494b-a862-69d9b38881ca', 'attorney', 'documents:upload', '2026-11-13 07:39:37.099'),
('7bcca790-f0b5-4629-a1bc-c9e573016b0f', 'super_admin', 'time:log', '2026-11-13 07:39:36.957'),
('7be839fa-70ee-4270-a67d-8987d356aed8', 'paralegal', 'time:suggested_view', '2026-11-13 07:39:37.223'),
('8275a21c-f4a9-4521-919c-8e9b2aa9a5eb', 'super_admin', 'intake:view', '2026-11-13 07:39:36.922'),
('8330a0d0-7331-485c-bcb5-08089177de16', 'attorney', 'tasks:edit', '2026-11-13 07:39:37.119'),
('835c4014-8b6b-425b-867d-da30c1260cad', 'billing', 'expenses:create', '2026-11-13 07:39:37.278'),
('8610e3c9-d09f-4039-b137-b9a65050eef1', 'paralegal', 'documents:upload', '2026-11-13 07:39:37.186'),
('8927ab38-83c3-4538-939c-fca9b10df09b', 'billing', 'operating:view', '2026-11-13 07:39:37.299'),
('89bb2413-91ee-47b0-87af-e5cd9ac0b80b', 'billing', 'reports:financial_view', '2026-11-13 07:39:37.309'),
('89e9e22f-af37-4baa-b1e1-feedad21cc12', 'supervisor', 'matters:edit', '2026-11-13 07:39:37.337'),
('8a4e357e-cd91-4e84-83df-bd72c86deaa3', 'super_admin', 'reports:export', '2026-11-13 07:39:37.021'),
('8a8fb1b2-21e7-425c-b4e8-6abe0ae1b9c5', 'attorney', 'matters:edit', '2026-11-13 07:39:37.084'),
('8c3377a1-f840-4ae1-be6f-09b1578415d9', 'super_admin', 'documents:delete', '2026-11-13 07:39:36.933'),
('8db44013-2bc3-4dd9-9a06-7cb51a690494', 'super_admin', 'cosmolex:export', '2026-11-13 07:39:37.011'),
('8df4aee3-810e-4c72-81bb-4a644f0b30c6', 'attorney', 'checklists:manage', '2026-11-13 07:39:37.140'),
('8e5db45d-8333-4ac9-a893-a06c063105de', 'supervisor', 'dashboard:view', '2026-11-13 07:39:37.317'),
('90705ec7-4855-4f34-9757-9b896af91b22', 'super_admin', 'time:review_team', '2026-11-13 07:39:36.961'),
('908f4fce-e6ad-41df-a33a-5fb80d0c3f8a', 'attorney', 'deadlines:view', '2026-11-13 07:39:37.126'),
('90b313ea-3bd0-439e-a1c9-7eb68bfff9f2', 'supervisor', 'tasks:edit', '2026-11-13 07:39:37.368'),
('91d521e7-52db-40f4-aa57-0817f4678690', 'paralegal', 'tasks:view_own', '2026-11-13 07:39:37.200'),
('9401fbbb-3a15-4622-836a-619db9d02466', 'paralegal', 'intake:view', '2026-11-13 07:39:37.176'),
('958ca7e4-0385-42d9-843f-fe193a2034a5', 'attorney', 'time:log', '2026-11-13 07:39:37.129'),
('95ba384d-08fa-4930-a08f-92445b7b5b32', 'super_admin', 'intake:conflict_review', '2026-11-13 07:39:36.927'),
('97216c0e-0c5d-4e3f-a7b8-75e52939dc82', 'paralegal', 'clients:view', '2026-11-13 07:39:37.170'),
('9864a751-7f38-4012-b487-f136059991bc', 'billing', 'invoices:manage', '2026-11-13 07:39:37.288'),
('9cb59388-e524-467e-9bb4-3efd3459be8b', 'super_admin', 'integrations:view', '2026-11-13 07:39:37.040'),
('9feb6f7c-2b85-4984-8317-c7e6fed3cea6', 'super_admin', 'tasks:view_team', '2026-11-13 07:39:36.944'),
('a1bab09f-b560-4386-828d-677ad2c83aa3', 'supervisor', 'intake:view', '2026-11-13 07:39:37.340'),
('a295f3e3-332d-4878-af35-fcf290cc85d7', 'supervisor', 'documents:upload', '2026-11-13 07:39:37.351'),
('a49e4522-acb5-4c57-8fe5-e0deed66f0bc', 'supervisor', 'reports:staff_view', '2026-11-13 07:39:37.412'),
('a79f363b-abcb-49a9-a891-2f041128ce3a', 'super_admin', 'clients:edit', '2026-11-13 07:39:36.909'),
('a8f9eb89-0955-4de8-85aa-d82507130426', 'supervisor', 'time:log', '2026-11-13 07:39:37.375'),
('aa79e01a-edfb-49ba-9d03-239373024e82', 'supervisor', 'intake:conflict_review', '2026-11-13 07:39:37.345'),
('ac2b4939-22f4-4f5e-9c6e-3f230fd6faba', 'billing', 'time:review_own', '2026-11-13 07:39:37.266'),
('ac60b2cb-2b9f-4e1e-9d41-f399b2414c68', 'super_admin', 'intake:create', '2026-11-13 07:39:36.924'),
('ae47fb0d-73ae-4d64-bf8f-02483095e6e9', 'attorney', 'billing:overview_view', '2026-11-13 07:39:37.144'),
('af327a6a-18c4-4928-a6e7-177c38703351', 'super_admin', 'expenses:edit', '2026-11-13 07:39:36.985'),
('afb2cfa3-30b4-42a2-98eb-59f2a423a91a', 'super_admin', 'tasks:create', '2026-11-13 07:39:36.946'),
('b03b4c83-05b6-4d21-ba0f-188371ea19b9', 'super_admin', 'documents:view', '2026-11-13 07:39:36.929'),
('b1263644-d000-4aea-a96b-a691d30a8490', 'paralegal', 'portal:preview', '2026-11-13 07:39:37.197'),
('b3d47ac5-3ae4-470e-a4e5-b96e0ead7d41', 'attorney', 'templates:view', '2026-11-13 07:39:37.161'),
('b62f6994-8ad3-4409-8aa6-42ef58d3af31', 'super_admin', 'billing:reports_view', '2026-11-13 07:39:37.001'),
('b8077134-b8cf-4380-81bf-28028bfbe2c4', 'paralegal', 'notifications:manage', '2026-11-13 07:39:37.243'),
('b81dd8e8-7fce-4345-af6c-3e1fa9fa662d', 'supervisor', 'dashboard:approvals_view', '2026-11-13 07:39:37.322'),
('b86156cd-d95a-4f63-a7ee-55f10d7354bb', 'super_admin', 'invoices:view', '2026-11-13 07:39:36.988'),
('b9c62a36-6499-4002-ad07-225aed403cb9', 'super_admin', 'templates:view', '2026-11-13 07:39:37.034'),
('bb18dd8d-c52e-485f-8429-9bca9333a709', 'attorney', 'portal:preview', '2026-11-13 07:39:37.109'),
('bc691e32-7966-4352-a387-04007b3d1992', 'super_admin', 'reports:matter_view', '2026-11-13 07:39:37.016'),
('bdb633a0-5a61-4e26-b8ce-bc70f1a4bcaa', 'super_admin', 'invoices:manage', '2026-11-13 07:39:36.993'),
('bf99bcf0-0113-4684-bfdd-44b256b1b526', 'super_admin', 'roles:view', '2026-11-13 07:39:37.028'),
('c29b6757-84ee-4e76-ab6d-97d4827970b4', 'super_admin', 'roles:manage', '2026-11-13 07:39:37.031'),
('c592ef5e-199f-4330-aa48-555ebe1d8a45', 'attorney', 'tasks:create', '2026-11-13 07:39:37.117'),
('c5a7e799-de07-4cab-b49b-222de1d205e2', 'billing', 'tasks:view_own', '2026-11-13 07:39:37.258'),
('c5adc8a3-0b4b-44e6-b179-8d56dfa15006', 'attorney', 'tasks:view_own', '2026-11-13 07:39:37.112'),
('c6b41d00-037e-4185-a2a8-0b2af4f4da13', 'super_admin', 'invoices:create', '2026-11-13 07:39:36.991'),
('c8e84c03-3aa3-4276-a1bf-e44d06200918', 'billing', 'cosmolex:view', '2026-11-13 07:39:37.304'),
('c913af7f-4539-4042-ab7d-621744b61cc7', 'supervisor', 'expenses:create', '2026-11-13 07:39:37.409'),
('c9adb8a4-0847-4a6e-a79c-a64636f2025f', 'billing', 'calendar:view', '2026-11-13 07:39:37.260'),
('cadeb96f-c3aa-4b2c-99d6-d041590fffc4', 'attorney', 'time:suggested_view', '2026-11-13 07:39:37.134'),
('cb0c2b12-24fc-492e-9d37-d0d3f5855f2d', 'paralegal', 'intake:create', '2026-11-13 07:39:37.179'),
('cb49b5c2-813d-47a0-9c62-3a0291d61454', 'paralegal', 'time:review_own', '2026-11-13 07:39:37.220'),
('cda53d26-82cf-4007-9257-2ed6b305077b', 'supervisor', 'templates:manage', '2026-11-13 07:39:37.422'),
('d06bb3ff-9e39-4d9b-9e55-7fd56e88f35c', 'super_admin', 'clients:view', '2026-11-13 07:39:36.905'),
('d22283dc-8e55-4fd6-8c21-0b9665e37839', 'super_admin', 'audit_logs:view', '2026-11-13 07:39:37.058'),
('d294046f-b6bf-4fa8-a9ca-66429ab57af3', 'attorney', 'matters:view', '2026-11-13 07:39:37.079'),
('d8591a3b-c5b1-4d68-9d3c-a38d7f24d82d', 'supervisor', 'reports:matter_view', '2026-11-13 07:39:37.414'),
('da4fe7d4-e8d5-4a0f-aad8-2ad5e8489319', 'billing', 'expenses:edit', '2026-11-13 07:39:37.280'),
('db033b53-8149-4204-b941-9f4d7d828e5d', 'supervisor', 'checklists:view', '2026-11-13 07:39:37.388'),
('dcf9c054-7057-4dd9-bdb8-f80891a1edfe', 'billing', 'payments:record', '2026-11-13 07:39:37.294'),
('dd5d72c9-8b3e-4850-8838-1371ea843580', 'super_admin', 'time:reject', '2026-11-13 07:39:36.969'),
('ddd16ece-ad8c-4fd7-85d8-de65ba0637c4', 'billing', 'portal:preview', '2026-11-13 07:39:37.255'),
('de6e125d-5445-4085-8a61-8d5c8cb63164', 'supervisor', 'clients:view', '2026-11-13 07:39:37.324'),
('de6e6b60-423b-4b8e-8bbc-a4c7dd710db3', 'supervisor', 'intake:create', '2026-11-13 07:39:37.342'),
('e17089ae-1d53-4a87-b350-1625563cb3fa', 'attorney', 'communications:view', '2026-11-13 07:39:37.102'),
('e192d708-8bc2-43be-9774-17ee30a4f793', 'billing', 'time:log', '2026-11-13 07:39:37.264'),
('e29a8de3-3775-4bd9-8b30-4631459de7a2', 'attorney', 'dashboard:view', '2026-11-13 07:39:37.064'),
('e45ec3fb-3ee7-47b3-9700-c263e5f11f19', 'super_admin', 'communications:view', '2026-11-13 07:39:36.935'),
('e4c4ae24-393c-463e-9399-e62acab20dcc', 'super_admin', 'reports:staff_view', '2026-11-13 07:39:37.014'),
('e59b703c-2031-4d4b-88b5-14f33992973a', 'attorney', 'notifications:manage', '2026-11-13 07:39:37.164'),
('e665bc4d-0855-45ed-8fc9-46f7d62d3963', 'supervisor', 'clients:create', '2026-11-13 07:39:37.326'),
('e74a7662-e346-43d0-8f66-a74ac1a83e90', 'super_admin', 'matters:edit', '2026-11-13 07:39:36.918'),
('e98b82e7-71bf-4acd-a837-5fda686bd4c9', 'super_admin', 'expenses:create', '2026-11-13 07:39:36.982'),
('e9935623-401a-49c9-ba14-45c4a3bcf5ce', 'supervisor', 'communications:manage', '2026-11-13 07:39:37.356'),
('e99b8c52-3894-4cd9-b2c2-03e6857a8205', 'attorney', 'billing:hours_view', '2026-11-13 07:39:37.147'),
('ea907337-29ec-4c2f-a0f0-287c58d65b3a', 'supervisor', 'tasks:create', '2026-11-13 07:39:37.365'),
('eb0f26d7-6176-4b86-8e1c-af268346a51f', 'super_admin', 'reports:financial_view', '2026-11-13 07:39:37.019'),
('eb2fa8b2-692c-44f4-8087-eaa431e52340', 'super_admin', 'billing:overview_view', '2026-11-13 07:39:36.975'),
('eb40dc78-75a0-487a-a96e-c12e9881b09e', 'paralegal', 'checklists:view', '2026-11-13 07:39:37.226'),
('ef8665b7-469c-4032-8ae7-5fd21a25b497', 'supervisor', 'tasks:view_team', '2026-11-13 07:39:37.363'),
('f0ae8df9-ab51-44b9-a297-88df8c04070f', 'billing', 'trust:view', '2026-11-13 07:39:37.302'),
('f25a1f27-e9d8-4158-b1c1-bca7dfa37b0d', 'billing', 'expenses:view', '2026-11-13 07:39:37.275'),
('f36595b9-8fc5-44ae-b0f8-656e370d9b7c', 'paralegal', 'communications:view', '2026-11-13 07:39:37.188'),
('f902edc0-6cd9-48cc-a9c5-19251f7ef726', 'billing', 'invoices:create', '2026-11-13 07:39:37.285'),
('f9ba78a3-c49c-4ee8-a683-269460d713c2', 'super_admin', 'users:view', '2026-11-13 07:39:37.024'),
('fcd0bf81-5876-4394-b67e-52add2d759e3', 'supervisor', 'reports:export', '2026-11-13 07:39:37.417'),
('fde7045b-162d-4131-951e-b636c8706843', 'super_admin', 'checklists:view', '2026-11-13 07:39:36.971');

-- --------------------------------------------------------

--
-- Table structure for table `suggested_billing_captures`
--

CREATE TABLE `suggested_billing_captures` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `source_type` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `source_identifier` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `matter_id` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `date` date NOT NULL,
  `actual_duration_seconds` int NOT NULL,
  `suggested_hours` decimal(4,2) NOT NULL,
  `match_confidence` int NOT NULL,
  `activity_description` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `detected_rate` decimal(10,2) DEFAULT NULL,
  `is_converted` tinyint(1) NOT NULL DEFAULT '0',
  `converted_time_entry_id` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_dismissed` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `tasks`
--

CREATE TABLE `tasks` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `task_code` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `matter_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `assigned_to_user_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_by_user_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `due_date` date NOT NULL,
  `priority` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Medium',
  `status` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Not Started',
  `completed_at` datetime(3) DEFAULT NULL,
  `reminder_setting` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT '1 day prior',
  `urcp_rule_reference` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `tasks`
--

INSERT INTO `tasks` (`id`, `task_code`, `matter_id`, `title`, `description`, `assigned_to_user_id`, `created_by_user_id`, `due_date`, `priority`, `status`, `completed_at`, `reminder_setting`, `urcp_rule_reference`, `created_at`, `updated_at`) VALUES
('f1b9c35d-4f46-4bdb-84f1-f728ab414c7a', 'TSK-26-0001', 'fdefc7e3-861c-4838-a38a-f580b6c59e8b', 'tttt', 'yrrtyutyurt', '66c97d44-096b-4d34-8bd1-5691ba855e23', '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-16', 'High', 'Completed', '2026-11-17 07:44:12.661', '1 day prior', NULL, '2026-11-16 12:04:21.021', '2026-11-17 07:44:12.662');

-- --------------------------------------------------------

--
-- Table structure for table `template_versions`
--

CREATE TABLE `template_versions` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `template_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `version_number` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `docx_storage_key` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL,
  `sha256_checksum` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Draft',
  `change_summary` text COLLATE utf8mb4_unicode_ci,
  `created_by_user_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `template_versions`
--

INSERT INTO `template_versions` (`id`, `template_id`, `version_number`, `docx_storage_key`, `sha256_checksum`, `status`, `change_summary`, `created_by_user_id`, `created_at`) VALUES
('0015843c-7e56-4ddd-8825-b5d85bc450df', 'd82d1e8f-307e-43f0-9e98-0589bb521c66', 'v1.0', 'templates/CAT-145/template_CAT-145_v1.0.docx', '58dcde942815735acc7da9512d1b1e44c2f689088541a50013059b1c09a31eb8', 'Published', 'Initial catalog template release (CAT-145).', '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:26:37.754'),
('02dd54d6-98d0-413c-8b37-8b1dd6a1369d', '0dc971e8-a869-4e03-9104-11ca9932bd55', 'v1.0', 'templates/CAT-289/template_CAT-289_v1.0.docx', 'b79d5ab390f9ffc181df42f8947d8a315c53da7a73f263b0c70bdf07d7f633dc', 'Published', 'Initial catalog template release (CAT-289).', '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:44:21.971'),
('02f61270-49a4-46bb-87ec-b6a95478b939', '0820e407-4b30-4921-bccf-282400263ca9', 'v1.0', 'templates/CAT-010/template_CAT-010_v1.0.docx', '2e5147d0992536d2c0e73b62336b44836f047518a9c23ea65b3702a962f5eb88', 'Published', 'Initial catalog template release (CAT-010).', '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:08:19.002'),
('042435a0-f2fb-4811-891e-e9feb57900f1', '6d9fa8c3-7ad5-4b60-be5f-0e9f0cf6d1da', 'v1.0', 'templates/CAT-135/template_CAT-135_v1.0.docx', '40ccbafd5c82111ecfff90ec35966d4a9b2606dcfb0e0d8b64b60ba3226ebb96', 'Published', 'Initial catalog template release (CAT-135).', '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:25:28.318'),
('04d4f9e6-5cb9-430c-9102-a9532ca61256', '92c2a993-9d6e-4be3-a19b-30e334ca9696', 'v1.0', 'templates/CAT-157/template_CAT-157_v1.0.docx', '21de6d9384da294b13dd0579c0c384409a5bb04716b50c0cb0cf331bddcd2e66', 'Published', 'Initial catalog template release (CAT-157).', '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:27:59.859'),
('0527cd62-fdb7-4653-b0db-0199b267563c', '7c042e87-f677-46a2-976b-9922914b8964', 'v1.0', 'templates/CAT-112/template_CAT-112_v1.0.docx', '015f3a67a3058bfbf976baf3c3835986452c36447d4398c78cd62cdc18980d15', 'Published', 'Initial catalog template release (CAT-112).', '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:22:44.662'),
('0546be74-b575-4c89-9c7e-4dde025b29d8', '5c12bf3e-a55c-4ea0-b194-ed8374364d73', 'v1.0', 'templates/CAT-231/template_CAT-231_v1.0.docx', '02a3f4d964721b560cc9f2d1f50a0f540570ade2d1639629c161cf0f7b6055cf', 'Published', 'Initial catalog template release (CAT-231).', '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:37:20.927'),
('05d6bd45-cbbf-4e86-852e-fac15162a534', 'ab61154d-b6f2-4516-ab09-bc61024b7138', 'v1.0', 'templates/CAT-277/template_CAT-277_v1.0.docx', '9316546d6ac046d9dafc57f6fa5fcb843ef369fea71413764ea0e645c132e1d9', 'Published', 'Initial catalog template release (CAT-277).', '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:42:45.141'),
('05e48612-750f-40cb-b0e5-13058702e7aa', '685974eb-6f65-4716-ad7d-f417f8f1ab14', 'v1.0', 'templates/CAT-009/template_CAT-009_v1.0.docx', 'b73889a72f579dfa1302e709e48ebed852ab219de5f8954ecd41247af3fc246d', 'Published', 'Initial catalog template release (CAT-009).', '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:08:12.860'),
('06b41a84-824b-4759-b3f2-d49f9828dd05', '802dcc2a-6a28-47cc-824a-2e1c0bb618d7', 'v1.0', 'templates/CAT-228/template_CAT-228_v1.0.docx', '30687fa34fe4ba0f414b037c56ab347400082aab96291ffe86c93667e2c8695e', 'Published', 'Initial catalog template release (CAT-228).', '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:37:02.335'),
('08788e72-5146-48ca-98ce-5982d0d2b77f', '4d1e027a-1ae2-4c89-8ca2-d31042a2ec7c', 'v1.0', 'templates/CAT-194/template_CAT-194_v1.0.docx', '77948151f6161e5051f4c323919c5ee0531daa52ff8ac9be6de202fac60bfdea', 'Published', 'Initial catalog template release (CAT-194).', '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:32:52.802'),
('0a100241-1565-4041-8f2b-b25c3d3292a6', '8c004cfe-6bd8-4ca3-9225-e5b2f31f233d', 'v1.0', 'templates/CAT-029/template_CAT-029_v1.0.docx', 'e00266b3af67c038cb7fafe76fc2c3bd69027f6d690477ffe1fcc1ebff1a5a5b', 'Published', 'Initial catalog template release (CAT-029).', '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:11:37.540'),
('0ad99ee2-841e-468d-98b1-a51f2e5b51ee', '64ebfa99-f1e5-4db6-b9d4-fb37d7aea2da', 'v1.0', 'templates/CAT-101/template_CAT-101_v1.0.docx', '05b807a81d5d314c8b161cd8176c4870b64fd70829e25c46655af6f318967060', 'Published', 'Initial catalog template release (CAT-101).', '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:21:13.110'),
('0dd95a0a-5203-4716-ae35-89a0595c46d6', '57a26bf8-7951-4168-9b02-ca6cc6236bd9', 'v1.0', 'templates/CAT-089/template_CAT-089_v1.0.docx', '28aed74bbaf3f73419923c6507e7008eaa3c4e6d927c4e7cfc1f67b69be72db4', 'Published', 'Initial catalog template release (CAT-089).', '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:19:34.708'),
('0e4344b0-09b4-4cdd-8f95-c257f94fdc79', '09379ca7-72a7-4fd4-9a16-4adf5b6a8038', 'v1.0', 'templates/CAT-107/template_CAT-107_v1.0.docx', 'd8a31730ae1d7823a98de570a6337ad45c6fb942580673ca9a86883ba2d5209b', 'Published', 'Initial catalog template release (CAT-107).', '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:22:04.507'),
('114c5862-b73f-48ee-a72c-615ed35537b3', '46048326-0cd1-46ed-bba8-4d2b5e611987', 'v1.0', 'templates/CAT-123/template_CAT-123_v1.0.docx', '8086ff8ad12ecd8b7a45e2a36fb51c14f65460a3595960e9a9f0cc6661e44967', 'Published', 'Initial catalog template release (CAT-123).', '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:24:04.682'),
('1268ae6d-8b19-4bfa-876e-155d51e429c9', '06db1160-b526-47f4-b345-d58a6847e9c5', 'v1.0', 'templates/CAT-025/template_CAT-025_v1.0.docx', '5e687c841f47f888f78a51ef22c5f028afcf7122eb7c490417444c210e76aef4', 'Published', 'Initial catalog template release (CAT-025).', '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:10:58.045'),
('1287a3a4-02d3-4c40-85a0-194b36a3e598', '593ffb63-7e6f-43b0-a508-a3beeae76d80', 'v1.0', 'templates/CAT-099/template_CAT-099_v1.0.docx', '8b08d4bbb9d80391d920191a8003e44c88fb73cb26afe00363c33fd86ba2da6c', 'Published', 'Initial catalog template release (CAT-099).', '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:20:55.585'),
('131e2bc8-78b6-49ec-b3e2-835f46fa23ce', '216964a4-ec01-46f9-9661-7dd8a2d5066b', 'v1.0', 'templates/CAT-198/template_CAT-198_v1.0.docx', '5192d3ff560653e27b5134d0ad576c07eb92c89dd883a79db2b7aac965650e93', 'Published', 'Initial catalog template release (CAT-198).', '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:33:24.062'),
('14fc15d3-97ad-4511-8d69-9173305d7e50', '8d8e0e86-89c1-4247-b7e3-31efb7ec0b5d', 'v1.0', 'templates/CAT-212/template_CAT-212_v1.0.docx', '6c8d43aac406d260f05721411079f3310406f233f4a8ca4b98bccbfafe6df3ce', 'Published', 'Initial catalog template release (CAT-212).', '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:35:06.952'),
('1502c247-62a3-4463-81ad-ca1409cdd1a9', '5ee133a0-6687-4e47-9dac-7a8ec1a899f8', 'v1.0', 'templates/CAT-148/template_CAT-148_v1.0.docx', 'de2bdcf115e80cef55a1275437ebf08dfc8d4237190eee6793765d2c0acaecdf', 'Published', 'Initial catalog template release (CAT-148).', '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:27:01.396'),
('177ddea4-9282-497e-b399-6e5e9cf7c4bc', 'aec0385d-fc2d-4209-8651-e379015d92f4', 'v1.0', 'templates/CAT-063/template_CAT-063_v1.0.docx', '186ed008bc8c87657ee3325247723c30584f2ef03b7dc73264a38a543a64e2cf', 'Published', 'Initial catalog template release (CAT-063).', '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:16:20.040'),
('17a56c0b-c6dd-4ffe-a43d-9606642e8ed3', '475b248a-1af7-4da6-91c2-1604c5d82051', 'v1.0', 'templates/CAT-118/template_CAT-118_v1.0.docx', 'cc31ae4942f91ea422cfd7ce535552eb19907d5b59a72c2ec94c1562b45f64d9', 'Published', 'Initial catalog template release (CAT-118).', '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:23:31.235'),
('17b2f3bb-0fbb-4884-a827-24f65dc7b81e', 'b9511a5b-cca7-4389-ba15-5e31f1c13a41', 'v1.0', 'templates/CAT-055/template_CAT-055_v1.0.docx', '9e5fd19d03c7ac52e8d0e73fb6aa51823e70b6dd80524800de4ac34f8142e7a9', 'Published', 'Initial catalog template release (CAT-055).', '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:15:27.042'),
('192fa43c-6472-473c-a04b-d0e469bd25c8', '639076d0-5098-4940-812d-da9901a32e70', 'v1.0', 'templates/CAT-239/template_CAT-239_v1.0.docx', '7da9d2ed196d2055814f1f44887df753715caa0243e3c6a66a4d4de554373057', 'Published', 'Initial catalog template release (CAT-239).', '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:38:15.749'),
('19b4ea63-d6fe-4c78-a4aa-4e15274d8020', '9a5ed805-6f2b-4d90-a57f-ed9df5739dbd', 'v1.0', 'templates/CAT-247/template_CAT-247_v1.0.docx', '9d05e9103a721463ab008dfa467811cd97f4a168a278f90391c66b3cd973b1c8', 'Published', 'Initial catalog template release (CAT-247).', '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:39:14.262'),
('1a8791a0-7c79-45e1-a55a-0300de688341', '977beebc-485b-4fee-90bb-7aed3b66a9a3', 'v1.0', 'templates/CAT-140/template_CAT-140_v1.0.docx', '9f5e1bcf33df5088d8b5eb57acef9c9a732897ef5d571c0270109d4046163fba', 'Published', 'Initial catalog template release (CAT-140).', '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:25:58.891'),
('1aacba72-d077-47f3-b2b7-079f6780add0', 'e0ba5db5-f563-4a98-be89-0a4c8c7238b6', 'v1.0', 'templates/CAT-050/template_CAT-050_v1.0.docx', '1d57934b927bc949e32f3177924c1cd623ad0cb571757ad9ebcfe8c9945d1956', 'Published', 'Initial catalog template release (CAT-050).', '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:14:44.454'),
('1ae6da1a-7516-477c-9e1b-7ffeafd1bcb6', '5e82f7ca-6a43-42f1-85bc-39c3b79a5f29', 'v1.0', 'templates/CAT-155/template_CAT-155_v1.0.docx', '80b8cb9e2223db04f03f4619d062eb4c221e21f6b72860d9efe1798aec9939c6', 'Published', 'Initial catalog template release (CAT-155).', '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:27:47.278'),
('1bcd0da5-4d16-4f30-8022-024a77ac0d02', '7c7d3683-ec7f-4dc3-8a15-e10b88a2e5c5', 'v1.0', 'templates/CAT-240/template_CAT-240_v1.0.docx', '0c74919ff6ebb8f6165355327db642c1da8f014920c5094594e6cb568ae79748', 'Published', 'Initial catalog template release (CAT-240).', '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:38:22.229'),
('1bcd8d6e-d341-40f2-a658-171ab595c104', 'ecba4953-1f55-4836-9aae-cbb1ae4f1c80', 'v1.0', 'templates/CAT-276/template_CAT-276_v1.0.docx', 'e4557f08021cd6d351cd874105d6255b12fc3f980af978a13d23870ba2286286', 'Published', 'Initial catalog template release (CAT-276).', '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:42:38.075'),
('1c7b9b3b-4466-45fa-994b-f2cc4e40070d', 'b627f363-1ebf-41a6-adce-b91eb033d79a', 'v1.0', 'templates/CAT-175/template_CAT-175_v1.0.docx', '244b81b01c77a18b13e09526bbb684c0e997c9b4cdf294f89e9107cf9b2f3ed7', 'Published', 'Initial catalog template release (CAT-175).', '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:30:11.806'),
('1c97c77a-8d55-4921-b569-90482c80ddac', 'aec9fbb6-5578-4c5b-98c5-8d52c4482ce2', 'v1.0', 'templates/CAT-154/template_CAT-154_v1.0.docx', '9ee925b3c5257cbe82b6060f21f25d86c7a2f063fe1dc1a3bcec76c87ed15e93', 'Published', 'Initial catalog template release (CAT-154).', '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:27:41.448'),
('1ec6c840-2b23-40bf-a2ae-7145c973e095', '25a838af-09c3-464f-8d09-4e2d365e57ae', 'v1.0', 'templates/CAT-268/template_CAT-268_v1.0.docx', '9cb390ccb5a165a7aeee3dfb32a6ed4dd903260cfba18103ba3044f6fdf5aab5', 'Published', 'Initial catalog template release (CAT-268).', '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:41:39.010'),
('1f4de991-5e27-4cca-97fb-d30b56289a97', 'dc814aa3-51df-4a0e-9753-d4daadf3d1d4', 'v1.0', 'templates/CAT-076/template_CAT-076_v1.0.docx', '984c4af3f7a31dfd55e1649e7dcf61758033605754463fdfff963d3a6ea8e647', 'Published', 'Initial catalog template release (CAT-076).', '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:17:54.539'),
('226f643a-3838-4870-ace9-92382b262487', 'd421b573-609f-4cc9-b76c-064d1b241dd8', 'v1.0', 'templates/CAT-062/template_CAT-062_v1.0.docx', '97ee35f791a4340d33def967eb00ecc75d0a1130e70f7f7ffcc0807b6a1d6b26', 'Published', 'Initial catalog template release (CAT-062).', '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:16:13.582'),
('228a46fa-e493-4eed-8057-2350df11cfba', '47a69abb-1d3b-4d63-998b-49a7a632aa69', 'v1.0', 'storage/templates/112/template_112_v1.0.docx', '43ce0dee46d4f4c48451deab765f17ded688b47c580768518d1f19aa47d503ca', 'Published', 'Initial verified master production template release.', '1a1c1f3c-1a81-47aa-bad3-ec5fd76b9730', '2026-11-14 09:29:49.029'),
('229186e0-fd2e-47f1-8232-6cb06d441d40', 'fc01163b-decd-4791-96bc-87237dc8ac62', 'v1.0', 'templates/CAT-147/template_CAT-147_v1.0.docx', 'fdfea4a67f94aa10ea6839377a0490d7773b013a62e2e0d4d9aec8d274c169de', 'Published', 'Initial catalog template release (CAT-147).', '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:26:52.668'),
('23677d2e-5004-42ab-9cf0-46261d6258e5', '677a2c45-3247-4acb-af17-97e94baac5bd', 'v1.0', 'templates/CAT-259/template_CAT-259_v1.0.docx', 'e89477532f1e3c67164ae4ebfc6427acfb65ef8fe88f548f18967b5f2337fd57', 'Published', 'Initial catalog template release (CAT-259).', '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:40:34.614'),
('23bb7516-3519-4d23-ba71-d470de1605e0', '641e5d63-4499-4c8c-9c16-485cb3b2e451', 'v1.0', 'templates/CAT-273/template_CAT-273_v1.0.docx', '9a6c5b1c8da0f729f573861be11846bef6a459b7090f66315de90cac25f2f506', 'Published', 'Initial catalog template release (CAT-273).', '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:42:15.911'),
('241fd3a3-0135-4a8b-a617-c23cdff79820', '9ed7c292-f725-44db-bb97-a2db35587d7e', 'v1.0', 'templates/CAT-201/template_CAT-201_v1.0.docx', '58932596cb79d45b2ed8f5e266e907c11e2986b8dfa537ffda283ac5179a62cb', 'Published', 'Initial catalog template release (CAT-201).', '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:33:50.854'),
('24be09a7-7d8c-4d14-a6ad-4438cf0d12d8', '2a36dbf5-47ec-4300-b2d3-90dfabe8b618', 'v1.0', 'templates/CAT-161/template_CAT-161_v1.0.docx', '083e27fc717df07364c402ef6d6ca87a066d57cb46cb792b08b3e5bcd1c14097', 'Published', 'Initial catalog template release (CAT-161).', '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:28:22.849'),
('25531579-7684-49e9-ab21-c54085ab9f06', '0c1ceff7-afe7-488a-af33-42ff9cb4e6d0', 'v1.0', 'templates/CAT-197/template_CAT-197_v1.0.docx', '286c5be49c27bc1a9150cf9a7f15534b51d37b3fd761f663255ad106ec420a83', 'Published', 'Initial catalog template release (CAT-197).', '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:33:15.311'),
('25cda274-07df-4c65-88da-f1ff8e45e0dd', 'af4250cb-54a0-4464-b14c-9f8798f4786b', 'v1.0', 'templates/CAT-111/template_CAT-111_v1.0.docx', '6ef9b0b26fe656559c50124e283aa2d86e81aa540f7f8d310869c0d06fed2c42', 'Published', 'Initial catalog template release (CAT-111).', '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:22:36.613'),
('25ed3bd4-4976-43e6-9a0f-75696cae49f6', 'cb8b4aeb-1c40-40ce-bded-7f8cbc2d298f', 'v1.0', 'templates/CAT-233/template_CAT-233_v1.0.docx', '0e6bc832669fbec1a38b09d6761cde6bb04ed2da270b838d68fc2ac6e6b8b438', 'Published', 'Initial catalog template release (CAT-233).', '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:37:34.236'),
('27f17c2f-55ae-406c-8d5d-1cde5931934d', '15836596-59b3-4de3-a112-20a5158c2b99', 'v1.0', 'templates/CAT-182/template_CAT-182_v1.0.docx', 'e57a6248893a96accb64bce34631f77b5230c21d91239f14d7ead109a37f3477', 'Published', 'Initial catalog template release (CAT-182).', '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:31:06.958'),
('27f73e77-5dbf-4beb-947f-2cac6003fbd8', '1fc76c4c-232d-4040-8e65-6a07ac50113a', 'v1.0', 'templates/CAT-038/template_CAT-038_v1.0.docx', '0a108083de4ea1f07f95d1e70aaac5fe9355d548ba940312804fd69374921b8e', 'Published', 'Initial catalog template release (CAT-038).', '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:12:56.213'),
('2921473b-3172-4a76-9567-4533d18df0a9', 'f0f3d622-cc50-4c40-a4e8-026bb73495d9', 'v1.0', 'templates/CAT-082/template_CAT-082_v1.0.docx', '20a46b2614aa5fe1fe99d29ec1613248b0b16ec906035037746b04a23497422d', 'Published', 'Initial catalog template release (CAT-082).', '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:18:33.651'),
('29d5db33-4c61-43b3-b55c-5ca8253f38e0', '4dce74ee-04b3-4e0d-80b8-f94562a2d30e', 'v1.0', 'templates/CAT-080/template_CAT-080_v1.0.docx', '468aae76dc71eadbf2d039e0a104412d2d047c8062713b1dfc863b9ef54ec24a', 'Published', 'Initial catalog template release (CAT-080).', '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:18:20.075'),
('2aaef701-5ea8-42cc-b381-3aad1aaac0e3', '2e7970f7-243b-4c11-bbe4-136d31708525', 'v1.0', 'templates/CAT-027/template_CAT-027_v1.0.docx', 'c383e6a17eb00ab923e2aacf0829dea12b61652b34fb658435426effe08302f0', 'Published', 'Initial catalog template release (CAT-027).', '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:11:16.455'),
('2c0605e3-233d-47b9-b595-5dc7dedf36a1', '4d83a415-63e2-4a97-8fad-cf88036cefd0', 'v1.0', 'templates/CAT-245/template_CAT-245_v1.0.docx', '1b792949daba3dec6378f744ffaef1d0311d8614490d2c99b052e29dadc8c0b5', 'Published', 'Initial catalog template release (CAT-245).', '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:39:01.771'),
('2f5620bd-ff68-4eda-8b79-fe8f49ae40db', '2db483ac-126c-4cba-98d5-5d85e5dcc17b', 'v1.0', 'templates/CAT-206/template_CAT-206_v1.0.docx', '94ed53ee049dbdf5c0c73c75d172dce167643ce33ba1c9a4a07a02f72cbfa6ff', 'Published', 'Initial catalog template release (CAT-206).', '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:34:22.712'),
('30de11a9-0130-4ce3-a0a4-0c8dd83ffc8b', '50d89734-ab18-4837-981a-bb0f37e6d74d', 'v1.0', 'templates/CAT-221/template_CAT-221_v1.0.docx', 'e4802f76ee9abeab721a8e256cdb6063ebc3d190f865f1bc98c5dfc2fc021231', 'Published', 'Initial catalog template release (CAT-221).', '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:36:14.287'),
('328ff179-ebf1-42aa-ad4b-5453495df5ce', 'a1782b10-81a1-4784-a9a7-da6bddde477d', 'v1.0', 'templates/CAT-065/template_CAT-065_v1.0.docx', 'c8eec4c5de25da8004e4048b0997d7c489449b908ca1bf8fc161458d9b7a4192', 'Published', 'Initial catalog template release (CAT-065).', '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:16:33.611'),
('32f25e0b-12dd-48ac-ac0d-c0a67fdaf285', '6cc1d679-c136-4c1f-b262-6b3828305084', 'v1.0', 'templates/CAT-222/template_CAT-222_v1.0.docx', 'ac324ce947b32e934ee020dde06a6c069839b54cade36a357b5de0534a4bddab', 'Published', 'Initial catalog template release (CAT-222).', '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:36:20.721'),
('337aeffc-4ece-4ce7-82a5-d6b928eefac4', '3afb4bc6-0545-496f-be31-a08e930cfb54', 'v1.0', 'templates/CAT-014/template_CAT-014_v1.0.docx', '37a3dd09b489d9bc27edbcb83ec8da2a532a5d2f443355697715fffba9daa8dd', 'Published', 'Initial catalog template release (CAT-014).', '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:09:02.748'),
('33c3b86e-3b0c-4b3a-a5f3-15a26b0395d5', 'ead50a5e-c335-490c-9c6c-d8940f29ed92', 'v1.0', 'templates/CAT-044/template_CAT-044_v1.0.docx', '5621f6ac3a5f116b0ba43acb8e37a62ab62589713898f595c1a541f5b13c6972', 'Published', 'Initial catalog template release (CAT-044).', '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:13:55.497'),
('34590700-cfd8-4fe4-bbd5-8519dee10003', '43d8d6ce-4a93-45ea-9ee1-6f23d6079fd9', 'v1.0', 'templates/CAT-230/template_CAT-230_v1.0.docx', 'f80b35910dc065f83f5fc8edaf7be96872f5b1075772b6f13bb788e1ff6dcbf0', 'Published', 'Initial catalog template release (CAT-230).', '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:37:15.408'),
('34c7c015-df07-496e-ae4a-c4d9cf030a99', 'dd506916-8629-420a-a3c8-f52f32c6c865', 'v1.0', 'templates/CAT-084/template_CAT-084_v1.0.docx', 'e1a80b6b3770371bd03faa029d9f23439fc191cb45805009309d0bde71525fe4', 'Published', 'Initial catalog template release (CAT-084).', '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:18:50.518'),
('3518a797-b578-4ecf-90f0-c21e436d54ed', '8a83200c-2735-4c3e-87ab-760827d37411', 'v1.0', 'templates/CAT-068/template_CAT-068_v1.0.docx', 'ee0a989c664f62e937f036de71572d4c941d91cea2c5d598507459d279f33677', 'Published', 'Initial catalog template release (CAT-068).', '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:16:53.697'),
('375fa418-f38e-4b87-91af-b4da814d3c41', 'e0fa7a0f-d012-4019-b761-cf1430cbe5c2', 'v1.0', 'templates/CAT-255/template_CAT-255_v1.0.docx', 'c4804201ebd23f11244e198f3826a3a5220dd5e78c3c3cc39fc18aca3e4c0b29', 'Published', 'Initial catalog template release (CAT-255).', '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:40:07.667'),
('38802e64-abb7-4888-9103-69a8af7f72da', '2e5d6f2a-48fb-4ca7-866d-a98f0ab02ce2', 'v1.0', 'templates/CAT-153/template_CAT-153_v1.0.docx', '9647302bf1e61563b73907468f60be10d858b106c9059afb7ee0011ddf76f7ab', 'Published', 'Initial catalog template release (CAT-153).', '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:27:34.610'),
('38dfc741-2eb3-490f-aee9-85ee6a82c9f5', '73975f5c-4405-4d22-b0bc-593803ff78d0', 'v1.0', 'templates/CAT-214/template_CAT-214_v1.0.docx', 'af31fb8fd5273d5af7afaca1eb2b663d8abb46d3e38d980812719d2ce56c2aaf', 'Published', 'Initial catalog template release (CAT-214).', '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:35:22.673'),
('3a87d8d8-132a-4617-8d8d-eab7b162be4a', '1516c541-358e-4fc7-b44a-9ac7148aeafb', 'v1.0', 'templates/CAT-169/template_CAT-169_v1.0.docx', '6128e72be3a1642ce07c6a908b913c984b99664f3b18487505800619e79ebfb3', 'Published', 'Initial catalog template release (CAT-169).', '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:29:16.116'),
('3a8c0d1e-c077-4ffd-a5f3-9771fd6187ab', 'da7e6ac8-e7f6-4fda-a381-e353c5bf361d', 'v1.0', 'templates/CAT-159/template_CAT-159_v1.0.docx', 'd47ffd8431c09545e33785e226c12fcd3ba47be3890bc7af0fecaa29e8a74d1d', 'Published', 'Initial catalog template release (CAT-159).', '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:28:12.409'),
('3bbc2c93-4f93-48e7-828d-2a34553167e2', 'f8a9586b-9d53-4953-90d2-5a0c260a90ce', 'v1.0', 'templates/CAT-060/template_CAT-060_v1.0.docx', '390a4293afa1f2d4651bf4d3d3688413e0f27b25f5f4ce41a9be2a4890ed49fd', 'Published', 'Initial catalog template release (CAT-060).', '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:16:01.257'),
('3cdd654e-d99e-42e9-a77a-8687e4163a1f', 'd422d311-0920-4994-a170-3056a037a137', 'v1.0', 'templates/CAT-030/template_CAT-030_v1.0.docx', 'd97614e934b1525f81070e75750549a06362d9d277f074bd289b3edcf98b8e1b', 'Published', 'Initial catalog template release (CAT-030).', '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:11:47.534'),
('3d18b45d-4569-4168-be21-a212ad7882bf', '8f35556c-8b73-4c84-8514-6eeec0553388', 'v1.0', 'templates/CAT-223/template_CAT-223_v1.0.docx', '6d307919cdd53dc69d35450975d638607f55a154213336f45c09fdc943b40bed', 'Published', 'Initial catalog template release (CAT-223).', '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:36:27.490'),
('3d32beda-4c29-4858-a945-a78c68a9eb1c', 'e3900301-511e-4443-9a7f-daf3b41b66f3', 'v1.0', 'templates/CAT-086/template_CAT-086_v1.0.docx', '267a024e17b2f57d05d4bf07be88181389754cef5c9e039aadd53272d475c71c', 'Published', 'Initial catalog template release (CAT-086).', '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:19:04.418'),
('3d93dfc7-961e-4026-b271-9ba36c32e208', '82cdf1c3-6fcd-429c-9e46-f4f782a25b4e', 'v1.0', 'templates/CAT-018/template_CAT-018_v1.0.docx', '0777f8a270ff28f9f53dc236374810dddbe4922db074c3a0d543383137e23977', 'Published', 'Initial catalog template release (CAT-018).', '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:09:52.800'),
('3dcceccc-1e07-4dd6-8f21-e7a09f064265', '5623b776-2e88-43c8-9533-77698c1a7ae8', 'v1.0', 'templates/CAT-032/template_CAT-032_v1.0.docx', 'c464471093f4e918d4b26433f1dbff4fa8ecf1ac90dea141b43f87847a4fcf59', 'Published', 'Initial catalog template release (CAT-032).', '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:12:01.509'),
('3e010dc9-fa85-4ad9-8a07-540f5b72d1ea', '962821f6-1816-4d4e-96d9-b919c996e014', 'v1.0', 'templates/CAT-288/template_CAT-288_v1.0.docx', 'f0b45ac2c93554d945c8b190ab22d0763e9ecd31000ec25046be53fed7da9fe4', 'Published', 'Initial catalog template release (CAT-288).', '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:44:14.592'),
('3e064705-e7f1-40a4-95c4-ef2c47f0d106', '70000e17-bf77-4572-a1b2-81baf00478cb', 'v1.0', 'templates/CAT-150/template_CAT-150_v1.0.docx', 'cb389468c01bad09a2dbe2b87b634f2ee44fd37c03f36b185022d0bc56039997', 'Published', 'Initial catalog template release (CAT-150).', '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:27:15.761'),
('3e0af65d-626c-4468-8b9b-6b10b044165b', '540c0bae-c5f3-4dcc-9b8b-0870cf156c0b', 'v1.0', 'templates/CAT-066/template_CAT-066_v1.0.docx', '220d45c33018fc16d1bed694acdcb2da4281c4d9d9bad63323a897ed30653f60', 'Published', 'Initial catalog template release (CAT-066).', '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:16:39.847'),
('3f0f23bb-0dd8-403d-ae37-f520c2cf7c4c', 'b22b2ef8-3814-4027-8565-c475c7afda14', 'v1.0', 'templates/CAT-041/template_CAT-041_v1.0.docx', '6f9ca9f5801f2ba3df12bda3ccc70dda55442995df51e7383aec591d000c0416', 'Published', 'Initial catalog template release (CAT-041).', '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:13:30.201'),
('3fb28c83-bc70-4ab4-a3d7-b19b4e664c6e', 'd69ab151-17ad-49e1-8806-ce5f1fbbfbd8', 'v1.0', 'templates/CAT-215/template_CAT-215_v1.0.docx', 'd126865a6f725fd182513598142a31bcabd741be1a55918e28bb15bd31f4b165', 'Published', 'Initial catalog template release (CAT-215).', '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:35:30.628'),
('408fd535-3b97-461c-8322-f60137e1dd85', '0b8d82cd-2388-48a4-b33e-06b6e3005b45', 'v1.0', 'templates/CAT-166/template_CAT-166_v1.0.docx', '7aecccfbec04172fbee595ffe8751ec2f75f9d2c948d1fb1987c55a7bd2926db', 'Published', 'Initial catalog template release (CAT-166).', '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:28:53.764'),
('40b1c509-16ea-4fb3-b050-c2dc12af9afa', '52e5ce80-078b-426a-ae9d-e34874abeb30', 'v1.0', 'templates/CAT-219/template_CAT-219_v1.0.docx', 'f25965ca17ced37fde1cc36391cfc6f9db995cabc10a865ef1d353bb0e523216', 'Published', 'Initial catalog template release (CAT-219).', '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:35:59.775'),
('4189fd31-bd9b-4fce-ad0f-0e859a2cdb7d', '827cf62a-7bd4-4247-a109-031285334bdf', 'v1.0', 'templates/CAT-020/template_CAT-020_v1.0.docx', 'de8fe0caaf677458ad85c1d4d9a175672df320fe2e6a0a256b25937df5b91633', 'Published', 'Initial catalog template release (CAT-020).', '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:10:10.077'),
('42179f92-f848-41f2-9b02-33744044ae7a', '90d73340-06e0-4cdd-9e5d-832f23af8f8c', 'v1.0', 'templates/CAT-015/template_CAT-015_v1.0.docx', '764743a6605cddf7a88a56ddce528f55f91c859c795eac5864b42ae7724fefbb', 'Published', 'Initial catalog template release (CAT-015).', '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:09:18.012'),
('4226ca5b-e6e1-45d7-9cee-96843614940c', '39e0fa08-147f-4465-9b81-f6d7bcf5d486', 'v1.0', 'templates/CAT-045/template_CAT-045_v1.0.docx', '0b0f170d91dc5400078939b9b85075d51b30502745cff22367d7ebeaa77e6f03', 'Published', 'Initial catalog template release (CAT-045).', '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:14:03.120'),
('457c84fb-c3d9-485b-8f89-ed18a04371b7', '015f67c2-e6b2-47fc-b822-9c079485d41b', 'v1.0', 'templates/CAT-087/template_CAT-087_v1.0.docx', 'c784bd3d5cc986a4f370ad0c392408422f1452138c2f4113b5224186305325d4', 'Published', 'Initial catalog template release (CAT-087).', '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:19:11.121'),
('46f31fd0-867e-4edf-bacc-1923e699b8ac', 'f8990bd5-3b01-4720-9dce-fa97daab1633', 'v1.0', 'templates/CAT-024/template_CAT-024_v1.0.docx', 'd121e8f4927fee2276ffa3cab6dc2b136ec2a5ce3afa71fa2408815e9891444d', 'Published', 'Initial catalog template release (CAT-024).', '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:10:46.357'),
('47eba881-7be9-448c-a110-8e078bcd7706', '718afda2-71d4-4725-a047-3bc1bda9c8a4', 'v1.0', 'templates/CAT-185/template_CAT-185_v1.0.docx', '5f807c24c3779b5ed82e88aaf24561922d1a7cd7a79360dd8ce4b4914c2223f6', 'Published', 'Initial catalog template release (CAT-185).', '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:31:33.372'),
('497c01fc-7892-4af1-a8db-5950154bb4bc', 'fce9f466-e498-4d9f-8911-be8d217071d1', 'v1.0', 'templates/CAT-267/template_CAT-267_v1.0.docx', '615c3de9758f6150e420959efd176c8709554caec003ea6ff8f06375a983e75f', 'Published', 'Initial catalog template release (CAT-267).', '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:41:29.667'),
('4a08e886-9403-4d5f-8cf6-8666d9bad508', '53785f29-1971-4285-9016-8584e2e7144a', 'v1.0', 'templates/CAT-253/template_CAT-253_v1.0.docx', '9b62d53e84f7b493cb97b1314c3403e1aa2a855b7503076d4cc4b90f48f06e94', 'Published', 'Initial catalog template release (CAT-253).', '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:39:55.755'),
('4a8557bf-69eb-447c-b559-e45c3ee6584d', 'ca7943ca-3f32-412f-a088-847eb0b2b940', 'v1.0', 'templates/CAT-281/template_CAT-281_v1.0.docx', '30a6603d5d61a09b0f32c21b8750a5cc6f9dcb009f4236b859a97e7aa18ee7b0', 'Published', 'Initial catalog template release (CAT-281).', '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:43:19.390'),
('4bbb16ac-a0c8-4ead-87b5-1d3fd4c9997c', '31691f0e-386c-4e43-a124-80b35792c9ab', 'v1.0', 'templates/CAT-266/template_CAT-266_v1.0.docx', '69820cd633274ac7f5813b41d15bf2886368be7b07e90031a6cbcc321ba7ebc1', 'Published', 'Initial catalog template release (CAT-266).', '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:41:23.875'),
('4bc4828e-f99f-4897-9448-cd2ad8e39c37', '27a2e416-243b-41df-bd83-7ca8ca9b4bb2', 'v1.0', 'templates/CAT-295/template_CAT-295_v1.0.docx', 'b6cc6dfa5e25cb78b31ccd52d58b0c02ede723475a7614cc2b2d537fe839b1a6', 'Published', 'Initial catalog template release (CAT-295).', '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:45:03.790'),
('4dd43b62-0d3b-44e7-81cb-7adce004b7a6', '44cd4125-ce90-4d76-9fc6-0a77398ad1d5', 'v1.0', 'templates/CAT-209/template_CAT-209_v1.0.docx', 'af3d20566fd8687be4151a27a77ee55416e7e8daeaae20b86469704f52a37375', 'Published', 'Initial catalog template release (CAT-209).', '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:34:41.992'),
('4f9a81a9-9252-4774-9e0a-dd01e6c80ac9', '5e2561f3-4fa5-4cf2-9309-c5229c217860', 'v1.0', 'templates/CAT-031/template_CAT-031_v1.0.docx', '7d0e22e4659c94b36f0204acb6be028f8df8f6d337198f380a5637bc14d702fd', 'Published', 'Initial catalog template release (CAT-031).', '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:11:54.187'),
('50a5e530-ac91-4503-a883-e3f98ebcb26a', '71d031f4-79a0-4d53-b4fb-e6417ad3b831', 'v1.0', 'templates/CAT-067/template_CAT-067_v1.0.docx', '347e061bcb291e7956abd7e501d08cab105462a71e56cf0317c12706a4f7bcd7', 'Published', 'Initial catalog template release (CAT-067).', '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:16:46.597'),
('512ed74f-1f59-4a55-bbb2-348dc6dc277e', '1725a3fd-9703-4f40-ad03-7dd5bbf4a47e', 'v1.0', 'templates/CAT-114/template_CAT-114_v1.0.docx', '268bf3652fed1ca85210c9c6099fdf4841f4a0c11aeefce6bcbc88b8b1ba0996', 'Published', 'Initial catalog template release (CAT-114).', '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:22:59.548'),
('531fb454-bd9a-4435-b96c-e5589881e3cf', '635fd210-3e0e-45aa-b6bb-dbbad4dcbd19', 'v1.0', 'templates/CAT-183/template_CAT-183_v1.0.docx', 'c2d7945e7b18fc8fbd844f6f15263931aadcc6d2b8aeedbd8cdba6e91cf2950a', 'Published', 'Initial catalog template release (CAT-183).', '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:31:18.939'),
('5347a9ab-7278-4647-bdd5-13d174237f64', '39dd4289-ce9f-4c2b-9ef7-c70fe8375c93', 'v1.0', 'templates/CAT-207/template_CAT-207_v1.0.docx', 'f923c9412e978f21e540085cdf670e4f73729ff12a8631f2635836967efb5fce', 'Published', 'Initial catalog template release (CAT-207).', '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:34:29.597'),
('5361481e-129a-40d6-9934-520daeffbe6a', 'd50331f8-1b2d-4c8f-8c58-9e05c727f6d3', 'v1.0', 'templates/CAT-189/template_CAT-189_v1.0.docx', '2998b9d0e2e0db702767d287c20edf6e46bfa91d87ca927cfcf20ac3b1365538', 'Published', 'Initial catalog template release (CAT-189).', '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:32:09.257'),
('53bc3d46-cfba-4978-aced-36898c7f25bd', '9cbd4d8f-da1a-4185-8e46-7f480575b0c5', 'v1.0', 'templates/CAT-199/template_CAT-199_v1.0.docx', 'f249d0968c8f95335dd302d82b9595a672642b8524aa50cdbc0e11cd978dfdfc', 'Published', 'Initial catalog template release (CAT-199).', '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:33:30.964'),
('53ff8796-c10e-45df-b002-dfdaf2e6f77a', 'd177f391-d966-4401-ad3b-94a9766fa1d0', 'v1.0', 'templates/CAT-064/template_CAT-064_v1.0.docx', 'bf7431d01f91c8cbd37e564a76d28c867e8042bc00c0a4bcfe29b15d2363e76c', 'Published', 'Initial catalog template release (CAT-064).', '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:16:26.633'),
('54999649-7637-42ef-bd53-49354c07f773', '68cc00d8-1e43-47bd-a1b3-4c24b6add04e', 'v1.0', 'templates/CAT-200/template_CAT-200_v1.0.docx', '5d9664bf4bba6ed4d4ab100625c70aab929c211f3879ad8fb7eea803cd79f1ef', 'Published', 'Initial catalog template release (CAT-200).', '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:33:38.395'),
('55c75bd5-de4c-42aa-8bef-cc597dec5070', 'a7608ee5-2ba3-4698-ac14-16aae4a07522', 'v1.0', 'templates/CAT-262/template_CAT-262_v1.0.docx', '760695b748d7d853215a6f17675e6dea53d5b3c496be7241734a70a83966823e', 'Published', 'Initial catalog template release (CAT-262).', '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:40:56.254'),
('55e6d123-74ea-443a-8bee-7a7913b1b687', '884b73af-9916-4e2f-b57a-a9e1d183994e', 'v1.0', 'templates/CAT-229/template_CAT-229_v1.0.docx', '71e9cfb950d56161c57d7e578c31bccba2d214019d38aef87131b04eea623f89', 'Published', 'Initial catalog template release (CAT-229).', '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:37:08.500'),
('57a5bfb2-dd4c-4b48-84be-e2d51eb69b99', '16211e5c-a798-431d-8540-e97cc280996e', 'v1.0', 'templates/CAT-113/template_CAT-113_v1.0.docx', '420d4f9e1e6fcf582a2325b8540f1759a42d971370bcf422447cd1fb2bbd56b9', 'Published', 'Initial catalog template release (CAT-113).', '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:22:53.102'),
('58cfe8c5-ef3d-4a4a-b367-577985a01b75', 'b565cbc6-f960-410c-9259-264998e8eb36', 'v1.0', 'storage/templates/113/template_113_v1.0.docx', '87c067b6d05361b0a73f79d424cc3590cab7998812d73644bb5b8a6fe2bcc4aa', 'Published', 'Initial verified master production template release.', '1a1c1f3c-1a81-47aa-bad3-ec5fd76b9730', '2026-11-14 09:29:43.932'),
('58ec5cad-437f-4a3c-8985-2768faed1166', 'e884c2c4-18a5-402a-b47a-d0d72ed59d94', 'v1.0', 'templates/CAT-211/template_CAT-211_v1.0.docx', '4c127af57c14e94b8642d520f992eb3b51d0521ef9b262b898f94f625be9a426', 'Published', 'Initial catalog template release (CAT-211).', '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:34:59.842'),
('592f3f30-cc15-4dbf-8cbe-976516e0ea61', 'f5d8926e-d95e-4234-a388-3b32147707a8', 'v1.0', 'templates/CAT-248/template_CAT-248_v1.0.docx', 'a47d7528d13e7e3e5993aa08a33b99dd925345ce5d4faeb13c6ad140edee76f1', 'Published', 'Initial catalog template release (CAT-248).', '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:39:20.650'),
('5a981617-df0e-4bdb-82f9-9d15d3011053', 'ae569c47-75e4-4bf0-a06c-ced476f0112a', 'v1.0', 'templates/CAT-272/template_CAT-272_v1.0.docx', 'f55578362775b5d5f2d35d77e0b4575e40b6ac6733c2f22b6649e83a4250f7e9', 'Published', 'Initial catalog template release (CAT-272).', '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:42:08.360'),
('5ba7f4b1-3bfe-41f2-b66a-9d4d563937e2', 'f44eb295-2c62-4dde-a305-80510ae1496a', 'v1.0', 'templates/CAT-172/template_CAT-172_v1.0.docx', '978878a3ab8eb734459d22e7b7c9eac4c11ac8a05867f982fc77bda5e1f20175', 'Published', 'Initial catalog template release (CAT-172).', '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:29:43.089'),
('5bfb7b62-bdf1-4121-be46-0f8efa189962', 'd59580bf-04e0-4e7e-9d35-6225740cdc66', 'v1.0', 'templates/CAT-257/template_CAT-257_v1.0.docx', '3c521e7d18cb184afe479b0a0a184b8d901748223d7b0489e196eba6c05f8e03', 'Published', 'Initial catalog template release (CAT-257).', '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:40:22.102'),
('5c4ed245-68df-47de-8fba-a74a422f4820', 'c49fd54e-f859-4ca8-904b-e8fd50110629', 'v1.0', 'templates/CAT-008/template_CAT-008_v1.0.docx', 'cc0425b15dbc49ec1bc4f3b208ca03ba6f29cd2334aed0a390bc4a289a5d9a5b', 'Published', 'Initial catalog template release (CAT-008).', '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:08:03.435'),
('5c908fec-6fd2-4583-8543-7d9d3047abc0', '04fb4136-c063-4dd9-9e36-24689fe2c58c', 'v1.0', 'templates/CAT-202/template_CAT-202_v1.0.docx', '664bd24af78926c0424e9572a8672a99b293400fa905bc1f73a1907e967e3e1e', 'Published', 'Initial catalog template release (CAT-202).', '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:33:57.709'),
('5d439c99-f896-4a7f-99e9-3f7c2bf237a9', '9f47fb05-1a38-4977-bfc7-8c872bdb60dc', 'v1.0', 'templates/CAT-098/template_CAT-098_v1.0.docx', 'f8e56b90403e0a6fc6b09df2e5261c1955baa3eae444c0f3331bb7a75bc1a0ce', 'Published', 'Initial catalog template release (CAT-098).', '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:20:48.401'),
('5d6da4fd-169a-4e72-a1f3-88e6ab30e6af', '7e4b54e2-a9bf-401e-8520-3d9b03ec8cf7', 'v1.0', 'templates/CAT-083/template_CAT-083_v1.0.docx', '6b7ac66f84d59da68c95b906ef74711387a92ddc68fd5bf12c6539e11ea6a8e4', 'Published', 'Initial catalog template release (CAT-083).', '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:18:40.684'),
('5da49101-918d-4970-8839-06070643f366', '17cfe3a9-5582-4877-8bec-2e405d08253b', 'v1.0', 'templates/CAT-127/template_CAT-127_v1.0.docx', 'edd729258c390e49e2d1534c069b65845bba36e7acd3f636dc52a6f41c8d94f5', 'Published', 'Initial catalog template release (CAT-127).', '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:24:30.718'),
('5dc8f9f7-ab83-4e49-bd46-3760dd97a48f', '93a6523b-cbe3-47eb-85b1-89ebf347dd65', 'v1.0', 'templates/CAT-188/template_CAT-188_v1.0.docx', '9f820f270fd3d86b242176080606a84510cdd9c6040150fdb2deefa8e8da2d56', 'Published', 'Initial catalog template release (CAT-188).', '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:32:01.647'),
('5dec737b-658f-47fb-9d9c-5f761ab5d42f', '1068bc35-2cca-4a25-aee4-9d12976a2155', 'v1.0', 'templates/CAT-178/template_CAT-178_v1.0.docx', '34ed7bdbe9102f65c545c2f2d66530c7522e6f4a73a082f4868367ea677802d0', 'Published', 'Initial catalog template release (CAT-178).', '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:30:35.622'),
('5e4ca444-af6e-4f60-a8d2-89e32991db04', '54fdfef6-a8d3-4466-85cb-1827742c44cd', 'v1.0', 'templates/CAT-256/template_CAT-256_v1.0.docx', 'aa19f8a2ad83c2a471c61f565a0e9d9fa6f48acd1c256b291670b2547733f88e', 'Published', 'Initial catalog template release (CAT-256).', '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:40:15.393'),
('5e4e18a0-301e-4bb3-865b-43e3f87e3ac7', '86438632-8e05-401e-a4e3-616d51af7e71', 'v1.0', 'templates/CAT-019/template_CAT-019_v1.0.docx', '25527befc30c3d512971d602b92a7fc47e3d966a1f58ba1c8fc5acb41a2394de', 'Published', 'Initial catalog template release (CAT-019).', '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:09:59.969'),
('5f1bd215-9ae3-4d54-abcb-1e3ee92b3623', '58faf1f8-8dc7-4085-8c81-fe3bffd00502', 'v1.0', 'templates/CAT-249/template_CAT-249_v1.0.docx', '0714b642497ef2b689620876904f08f337f2e77db8e55ee13160215eb5685811', 'Published', 'Initial catalog template release (CAT-249).', '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:39:28.396'),
('600309b1-9409-492e-8115-f1cadcf4a2d4', '0306f395-2238-4ea1-9c09-9a6d1e55cfb3', 'v1.0', 'templates/CAT-136/template_CAT-136_v1.0.docx', '9e2bc3e71876d5f36124ee5173146d5e206a9ede2555feb4fdd15f0ee34115ce', 'Published', 'Initial catalog template release (CAT-136).', '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:25:34.746'),
('60d1ffef-c3d2-4057-9737-b1eae70d5f43', '5153c226-b50e-46e8-ad95-8815e0fc2da2', 'v1.0', 'templates/CAT-171/template_CAT-171_v1.0.docx', '52df97e13c9917f3df27cd272dc8073d8d6f3fdbcc94c37556e9c456cd6e0755', 'Published', 'Initial catalog template release (CAT-171).', '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:29:31.214'),
('60d52c8c-966e-4e95-b691-cbc80e8d385f', '6b6fe847-2081-417f-8ae1-1f0ab2141d52', 'v1.0', 'templates/CAT-251/template_CAT-251_v1.0.docx', '2ac9a27967e340e449c39a12ab32d02217a5459145d997a1bfb223ab4a2834ea', 'Published', 'Initial catalog template release (CAT-251).', '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:39:41.551'),
('613a6b40-e687-4fef-b6fb-073e8e3bf25a', '94547c36-b00f-42db-9449-cd8900037bc2', 'v1.0', 'templates/CAT-238/template_CAT-238_v1.0.docx', '8b182db4899e1b1fe47545e5b038c8417cb41a20902a818070777ff6f08d085f', 'Published', 'Initial catalog template release (CAT-238).', '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:38:08.829'),
('61ce7918-34d9-4ca7-955c-4fc895d710ef', 'e112eab3-cb67-49aa-9e56-9d6da8c644e2', 'v1.0', 'templates/CAT-046/template_CAT-046_v1.0.docx', 'a4652c6e381fce08bad152b7590a1ed1c434ac4f1564201dc5040bf70f0da922', 'Published', 'Initial catalog template release (CAT-046).', '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:14:11.412'),
('624c4276-dd94-475c-b02b-8aadc8109363', 'a1dad545-e77d-4473-811f-566ff4b2c84a', 'v1.0', 'templates/CAT-156/template_CAT-156_v1.0.docx', 'c107b48843b9e67191c5999baafbdf93395d7aa9dd9fed47cba17d6667b4cb52', 'Published', 'Initial catalog template release (CAT-156).', '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:27:54.188'),
('63f83669-73d7-4103-8985-2988d5f0bd36', '9c4d5972-d996-444c-912a-a66a134d4d57', 'v1.0', 'templates/CAT-165/template_CAT-165_v1.0.docx', '78af2873b631682ebbedb130b36cd8e091700911149544053efe3fcbeda5e981', 'Published', 'Initial catalog template release (CAT-165).', '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:28:47.493'),
('646b3030-53a2-4823-8beb-0a9acb9a9610', '0577005e-4015-46f4-a839-81d4707c8da0', 'v1.0', 'templates/CAT-264/template_CAT-264_v1.0.docx', '2d6b379650e20fd77996a1134d5bc8c602afbb633cc175739bbc368d6ac5fa2b', 'Published', 'Initial catalog template release (CAT-264).', '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:41:09.163'),
('64dd38ea-8636-4110-ada9-9363f9452197', 'd12b9f0a-700e-4e27-8054-6f763f2c5a5b', 'v1.0', 'templates/CAT-162/template_CAT-162_v1.0.docx', '0715ad295419b38e34c31981d381a4ea93fd64f3ca69d3914222083101a4962d', 'Published', 'Initial catalog template release (CAT-162).', '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:28:29.468'),
('65587343-3be5-4fb8-949e-9ec79b5633e9', 'ff572cd0-e439-4d33-96cc-df2d34f691fe', 'v1.0', 'templates/CAT-181/template_CAT-181_v1.0.docx', '02679845ee8b902ed011aea9f3ecb8de5f573bffe289cc4845eb492fc7a0d36e', 'Published', 'Initial catalog template release (CAT-181).', '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:30:59.762'),
('673e6316-9e22-4650-8bbc-f87f1a2f7e3a', 'ed0e3c9a-1fe1-4a4f-a741-917965b42284', 'v1.0', 'templates/CAT-134/template_CAT-134_v1.0.docx', '305f107dc3fa38224144d06e4530c4a78170a41408fb604ed98ab97290782ab1', 'Published', 'Initial catalog template release (CAT-134).', '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:25:21.556'),
('684d2593-9a02-43e0-8595-0167ccf0ccc7', '85f599d8-adf2-4e81-a663-b0a440b7d424', 'v1.0', 'templates/CAT-058/template_CAT-058_v1.0.docx', 'b9644679d94abfff937a2b702fbec3bb0c0f56c3925e3bb71172610d3138590c', 'Published', 'Initial catalog template release (CAT-058).', '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:15:45.512'),
('689ca019-7b8a-40f6-8175-1c027a48a5cd', 'da9fa0f4-97ee-451f-b5c2-cdefc1326302', 'v1.0', 'templates/CAT-191/template_CAT-191_v1.0.docx', '7ddaf1484c5a52290a52fc6f3d55f9f23d2de6893a71f57b3a993cff33995364', 'Published', 'Initial catalog template release (CAT-191).', '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:32:26.150'),
('6aff411c-53cc-4f49-bda2-ecaad33a950c', '91bafe08-dbf6-4099-a316-f4720ff54682', 'v1.0', 'templates/CAT-286/template_CAT-286_v1.0.docx', 'ff309ab20deb39b7185dfd03ebab1a44a7f7324cfdbcd9cac861766ef41f404c', 'Published', 'Initial catalog template release (CAT-286).', '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:43:59.878'),
('6c598600-36e9-4b4d-a4b8-af354c65699e', 'd90e8825-69ea-42fc-aa8a-1c53eedbbb79', 'v1.0', 'templates/CAT-205/template_CAT-205_v1.0.docx', 'f0af0c807fada0717b67970fb746ca0e1a26ad9ee22dc174010c31e5c771d1f0', 'Published', 'Initial catalog template release (CAT-205).', '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:34:16.928'),
('6cd5cc86-0fd6-4dbe-b6a2-9ec56b0b5d54', 'ba5e47be-d226-4d98-8b07-899aa5a92263', 'v1.0', 'templates/CAT-033/template_CAT-033_v1.0.docx', '11d814780b9dded4a91d94509eb513fdd9623b46187b2cd194109988d22b908c', 'Published', 'Initial catalog template release (CAT-033).', '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:12:09.936'),
('6cf69812-251b-4c6b-a300-5f54eef3c0c5', '959e8202-4d3a-4c4a-a398-17f150aa32a4', 'v1.0', 'templates/CAT-142/template_CAT-142_v1.0.docx', 'f8281773668314f0282a5a3f1a277d7722d182f24d249a009a5ae034740bbf77', 'Published', 'Initial catalog template release (CAT-142).', '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:26:14.955'),
('6d06086f-03a4-44c6-a96d-fc371f6f8967', '8d6db27c-dbd8-4428-959d-be551d8e28a9', 'v1.0', 'templates/CAT-293/template_CAT-293_v1.0.docx', 'eeef693a4bbb405924d97b5ffb98de970323c39aeabaf5446efd77804170d523', 'Published', 'Initial catalog template release (CAT-293).', '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:44:49.450'),
('6e54ec21-da29-449d-bae3-5e59a42baf6b', 'f2b50571-0237-47b5-bf51-cf5581e93d7b', 'v1.0', 'templates/CAT-225/template_CAT-225_v1.0.docx', '89087faf30df52d5352d2e308a7d817c56108d0f6eba64f9269f990e0bc354ad', 'Published', 'Initial catalog template release (CAT-225).', '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:36:41.403'),
('6e739347-97f7-4a33-b95c-78043f9aed05', '4bedb78e-e248-4d99-a381-bf12c6a9fc33', 'v1.0', 'templates/CAT-091/template_CAT-091_v1.0.docx', 'fad5230de5c95c7016f7e26c11278dc77407b7e3870b82452f86c80d9c815790', 'Published', 'Initial catalog template release (CAT-091).', '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:19:52.633'),
('6e95af9d-a68a-4956-9c62-18e934c98f1d', '6bcade5f-6f22-40a3-993c-03e4abf417fa', 'v1.0', 'templates/CAT-246/template_CAT-246_v1.0.docx', 'b81e59842d7ba32c49aca3b9f2032e42cb17e8767a882abb0518272339392e7b', 'Published', 'Initial catalog template release (CAT-246).', '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:39:08.714'),
('6f4e7b2b-9b59-419e-9e16-9a91ef17a6ad', '34ad861c-3bf0-44fe-926f-a59f4942dc93', 'v1.0', 'templates/CAT-217/template_CAT-217_v1.0.docx', 'b9342cb5a6ef4d97c3d24ab8cf000e23c212e8aad86a54c4132e8c8d9902487d', 'Published', 'Initial catalog template release (CAT-217).', '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:35:44.995'),
('711d7253-2ea0-4e60-81b3-fb542fd7c2fa', 'f96a2000-d319-4f44-8607-a92d5cb873f9', 'v1.0', 'templates/CAT-040/template_CAT-040_v1.0.docx', '8ae84c80b730920cab49ff6fe05d42b7b3ae352673ff3e500e28c2c0ec167a92', 'Published', 'Initial catalog template release (CAT-040).', '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:13:17.503'),
('73efedfc-9f48-4cbe-960a-523e0de00400', '12c33d8f-b9e5-4764-aeee-1d38ac17a637', 'v1.0', 'templates/CAT-100/template_CAT-100_v1.0.docx', 'f0d897eaed5790fd14fae837dad2d791c2444f8e91d400ac6e5b3ea27a76dfe6', 'Published', 'Initial catalog template release (CAT-100).', '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:21:03.947'),
('7402b6b9-9787-4ceb-8664-88ca07ac3156', '8942d350-910c-4701-9752-ef655a421e7a', 'v1.0', 'templates/CAT-121/template_CAT-121_v1.0.docx', '0fdc74ac1609264a0acaf45221517f72324c2b3c86cbb223ba659afac22a2a5b', 'Published', 'Initial catalog template release (CAT-121).', '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:23:50.365'),
('743bda6c-ef38-42c4-9876-5bb952ba909e', '0a44de2e-b22f-4253-9d4c-9b58cdd69fa8', 'v1.0', 'templates/CAT-234/template_CAT-234_v1.0.docx', '736d63d6625ac0438c8ec037ce1a33397ae370d76b526413ef526525d7083e9f', 'Published', 'Initial catalog template release (CAT-234).', '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:37:40.653'),
('7589c3cd-fd6c-4337-9606-20bc893e01e2', 'ff8fa82f-2a39-4ee9-93d0-14ed3866da9e', 'v1.0', 'templates/CAT-193/template_CAT-193_v1.0.docx', '30db5bac5eb3c108b61fdafd02806898eb299e6fed999183dd1431435fdd6e53', 'Published', 'Initial catalog template release (CAT-193).', '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:32:44.786'),
('7619287d-b2b5-4020-a2f8-af71d2726f35', '3c4e2cf6-be4c-40d1-a9f2-b45873a3957d', 'v1.0', 'templates/CAT-299/template_CAT-299_v1.0.docx', '1862d2e45636c4d2fcc56026cea94fdd941fde40cda913a486a9622875ccd298', 'Published', 'Initial catalog template release (CAT-299).', '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:45:28.746'),
('76395bd0-02c0-43be-8bbc-63a75e09d00d', '35b83139-553c-45d2-a796-cb9faa2b9502', 'v1.0', 'templates/CAT-037/template_CAT-037_v1.0.docx', 'bf725b1cade886bdb67f9374bd0a436a767d4e461dae06196179500cd4226298', 'Published', 'Initial catalog template release (CAT-037).', '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:12:48.006'),
('76a7a39b-0455-4895-8841-3f04be9358e1', 'd29bea23-8381-48f1-8411-d42062292764', 'v1.0', 'templates/CAT-298/template_CAT-298_v1.0.docx', 'e9aa75a0b728fbbc4ab3881ffb75f9d0bcd2ff65d5f41e39970b09233e1236ac', 'Published', 'Initial catalog template release (CAT-298).', '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:45:23.110'),
('77fbb573-40db-43ef-b3f6-7856e2272e2e', 'c66417ec-45ef-4326-a78a-1441fe43d39e', 'v1.0', 'templates/CAT-138/template_CAT-138_v1.0.docx', '24c1252ee10245abe367dcbd097384fc01dd86b2a3b7549651e1457e683cc02c', 'Published', 'Initial catalog template release (CAT-138).', '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:25:46.767'),
('77fcdc30-31b1-4157-a660-84554edc5518', '6d76eb8c-ffb2-4eee-8f43-c22b8346f05a', 'v1.0', 'templates/CAT-094/template_CAT-094_v1.0.docx', 'b1e6c2a8afff3b0a8f5384d11f4aa1cd93323599dc6344d26887d10429233c5b', 'Published', 'Initial catalog template release (CAT-094).', '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:20:17.652');
INSERT INTO `template_versions` (`id`, `template_id`, `version_number`, `docx_storage_key`, `sha256_checksum`, `status`, `change_summary`, `created_by_user_id`, `created_at`) VALUES
('784a0a67-2de8-47ac-bd8f-7b457bd3e5ce', '430122fc-1db7-4fa7-98f6-1234d54b7b77', 'v1.0', 'templates/CAT-013/template_CAT-013_v1.0.docx', '41308e35c9af5422c6c96f1b23dca9fc34083617caad3ae15b1e26059f0e6ef3', 'Published', 'Initial catalog template release (CAT-013).', '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:08:48.958'),
('7c065d2e-46e5-4be9-8aca-231b61f602ae', 'bf5f76d9-851f-435a-881c-9492beaf80e0', 'v1.0', 'templates/CAT-081/template_CAT-081_v1.0.docx', 'eb0d83efd15959f964676fe33bd5e258d995c18a8690e62fbc6479545d8697d3', 'Published', 'Initial catalog template release (CAT-081).', '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:18:27.169'),
('7c968a6f-a8ff-49dd-a563-671184d476f0', 'db904335-776b-4c8d-8a16-edb2795e9c4a', 'v1.0', 'templates/CAT-023/template_CAT-023_v1.0.docx', '5befe327961931fa70614a6ff3eafa24a34c62cb49d22b7afe47030e4371163d', 'Published', 'Initial catalog template release (CAT-023).', '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:10:37.449'),
('7d717061-8a01-4197-a7ba-9aac4c28051c', 'cccb8b59-3baa-43b0-9275-dc2d72759fa7', 'v1.0', 'templates/CAT-274/template_CAT-274_v1.0.docx', 'c39158380f62ac8941442b3d0c0047d0ce6f0c4c64c23bbadafc58463aaed609', 'Published', 'Initial catalog template release (CAT-274).', '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:42:22.666'),
('7e30837a-d454-41ca-9705-e2a4f1ceccf7', 'e529d951-a9e7-482f-b09b-dcbc494d7583', 'v1.0', 'templates/CAT-285/template_CAT-285_v1.0.docx', '3fad6d657472a6a0f0673bdf8c002ff16fca4cc51fb490c1d56caf1425986eeb', 'Published', 'Initial catalog template release (CAT-285).', '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:43:52.167'),
('7e69c06a-139d-48d6-af7c-bbbc8ff7cf3f', 'f6f9d2da-1099-44ca-bcb8-55f582efc03c', 'v1.0', 'templates/CAT-297/template_CAT-297_v1.0.docx', 'b0a0f32b61d87ce686449e9a81f45369ca780f1d7167f8e6cb81df81143f1a50', 'Published', 'Initial catalog template release (CAT-297).', '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:45:17.740'),
('7f58167b-7eb3-464f-8b2e-1555bb0b09f6', 'c5af8efc-98d2-4685-91bb-3ef8dd772a28', 'v1.0', 'templates/CAT-158/template_CAT-158_v1.0.docx', 'b51c5e89cc362f292c13b6c178fefbc1af76902ef25f6094fca462f28978c779', 'Published', 'Initial catalog template release (CAT-158).', '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:28:06.109'),
('80fef0d7-db33-4f64-9345-7e456af3165b', '411f1e96-3b18-4d1b-9c9b-c7fca1276281', 'v1.0', 'templates/CAT-102/template_CAT-102_v1.0.docx', 'e0667ff14eaad24cb636760e4d39a2dc136eb8fcc6e62005da56a4d7f82c41b2', 'Published', 'Initial catalog template release (CAT-102).', '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:21:23.822'),
('82f334d4-a724-4cf7-834d-e7ffeb29d708', '3c6f78d4-9bf3-4ea4-bdf4-397fdc4133b7', 'v1.0', 'templates/CAT-282/template_CAT-282_v1.0.docx', '480c152a2b44ffe34dbbbb6c20c1dc25bb79a36de3f9f508cbfbe102be62b858', 'Published', 'Initial catalog template release (CAT-282).', '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:43:26.986'),
('836e1674-9f3e-4b15-bbdf-71e9f39cf358', '6e02648b-dae4-4a6e-b63e-f81bed9db40b', 'v1.0', 'templates/CAT-109/template_CAT-109_v1.0.docx', '9320b25e61d58f5e446158c974895a0e759baa6b0f455a28560fbf4984c4ae84', 'Published', 'Initial catalog template release (CAT-109).', '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:22:21.046'),
('84b6150f-c07b-449b-bc21-dc242056935f', '451b5eb2-f1be-40d9-9d84-fc5b634af9b6', 'v1.0', 'templates/CAT-179/template_CAT-179_v1.0.docx', 'c712165777b65703926acc85ae5b91951252d6ee2ad901964383e75869105259', 'Published', 'Initial catalog template release (CAT-179).', '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:30:44.324'),
('852400e2-7592-4ca8-a194-fbc1bf456fb1', '990d7be2-2fe7-4679-ae52-6af84e469504', 'v1.0', 'templates/CAT-278/template_CAT-278_v1.0.docx', '6c22d0e0ac82e1622f41ed6ad389bc99cc4c489196de55204c6039ac450b441e', 'Published', 'Initial catalog template release (CAT-278).', '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:42:52.489'),
('8550fd39-39c9-46e4-ac0d-b95d3ed4d125', 'dfbd2a44-eaf0-49a7-97d8-728746bff4da', 'v1.0', 'templates/CAT-227/template_CAT-227_v1.0.docx', '11f8abd2e14d497ada2f8e0d109352df6018479a0b02dfb35fe3f5f24d0cf0de', 'Published', 'Initial catalog template release (CAT-227).', '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:36:56.022'),
('85a9dc73-04a9-429c-bea2-9b6c30b6f1b8', 'aede9ec6-f291-4613-a057-3b6c1d5c9b21', 'v1.0', 'templates/CAT-061/template_CAT-061_v1.0.docx', 'fe78352bb52c1915c67d6c0d965aa56b89ffa2752f5809978e527d9d351b756c', 'Published', 'Initial catalog template release (CAT-061).', '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:16:06.548'),
('863ecb6b-acb2-468e-8280-6869008e38c4', '738b35c7-3920-48c7-b79b-8cb396c96e0d', 'v1.0', 'templates/CAT-137/template_CAT-137_v1.0.docx', '7b628d56851f243b14c8bc7b0a69cdb403a68f9ff8fa77191685d4be8ddef1f8', 'Published', 'Initial catalog template release (CAT-137).', '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:25:40.453'),
('87d1c498-8bb5-43b1-b07b-9b85ff412ce8', 'e8431131-abc1-46c9-ac38-97af3b31adc5', 'v1.0', 'templates/CAT-195/template_CAT-195_v1.0.docx', '28e06024c61991605b8013ef7e5b10577f7e78654050c52cb20da9d286974f0b', 'Published', 'Initial catalog template release (CAT-195).', '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:33:01.955'),
('88dbdb77-3188-4699-801b-9f4553338ebf', '63fd8887-c59d-4fa3-bdf7-e26f8a6f0f29', 'v1.0', 'templates/CAT-186/template_CAT-186_v1.0.docx', 'd4e145691909e9953765d694db42d7be56866cdb3c4b2d686a2ce84f60596461', 'Published', 'Initial catalog template release (CAT-186).', '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:31:41.857'),
('899c0e12-1011-483a-885a-3dd965fc3a50', '6db22820-136d-410e-9aaf-03cf5dc19dff', 'v1.0', 'templates/CAT-291/template_CAT-291_v1.0.docx', '5ace525d159aa4957845748dfd2248b04bb0a5e424be2d8e2c06e64578947b2d', 'Published', 'Initial catalog template release (CAT-291).', '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:44:34.395'),
('89b37ce7-9d86-4a99-883a-8c5506774e9a', '96e51fc4-20d8-47b3-b89d-5c800476be3f', 'v1.0', 'templates/CAT-090/template_CAT-090_v1.0.docx', 'c3df90a7d6ecee38e52ea6e2db475f2271ef1742788961952aee88ac93443fca', 'Published', 'Initial catalog template release (CAT-090).', '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:19:44.491'),
('89bfc8b5-afc6-4a24-a9fd-f558824dc2c7', 'cde595ed-fe2f-4cf0-bf1a-dec6ce1b9ab0', 'v1.0', 'templates/CAT-243/template_CAT-243_v1.0.docx', 'a3a69b7e11a2f47a1212a2696c6d269cf49f9ecf36c974e5b8c72bbf83662582', 'Published', 'Initial catalog template release (CAT-243).', '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:38:43.357'),
('89f74c3f-b3dc-479d-808f-a199f5f4480c', 'db721d5f-1857-4b88-a81d-1c31e3c9c7b1', 'v1.0', 'templates/CAT-242/template_CAT-242_v1.0.docx', '4ba5c4c6bb6ec3a78e9bc075e1901b49c0187b229c6a80e9b5df6df12562448a', 'Published', 'Initial catalog template release (CAT-242).', '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:38:34.336'),
('8a3a335c-5720-4c7a-8b84-63dd8464de50', '716b06dc-4a81-43d0-b69a-a7383799cc8a', 'v1.0', 'templates/CAT-006/template_CAT-006_v1.0.docx', '5af762f1633356d3cdfdcfefe31d0c0e0c10fd3a77ff611cddb36872f6806bc5', 'Published', 'Initial catalog template release (CAT-006).', '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:07:43.776'),
('8a427a6e-d37a-4951-8cd6-24e4ed518b16', 'ab1eee5b-b729-4d66-8791-de39ed6315ab', 'v1.0', 'templates/CAT-167/template_CAT-167_v1.0.docx', '2796bfde5f47039988faeb5d103838d5e87c909477e744ec40fa6b3c3fc10cda', 'Published', 'Initial catalog template release (CAT-167).', '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:29:00.511'),
('8ae67bb4-028f-4dfb-8a6b-bce202e8f897', 'e991fb8e-0e48-448b-a02e-58977074239f', 'v1.0', 'templates/CAT-085/template_CAT-085_v1.0.docx', '10276caffd1a6f45efe5e8d182d575bbe7368036ea88773aeb517191c2e4a42e', 'Published', 'Initial catalog template release (CAT-085).', '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:18:57.448'),
('8beb6f2e-6342-4443-b215-aaa6e92c6614', '278b93ff-c452-4e2e-b5f2-7f91bccc83ac', 'v1.0', 'templates/CAT-003/template_CAT-003_v1.0.docx', 'b6568ef8719015e820a2538aafd28633b2b59900e2b051a3b1c85c03c22c687e', 'Published', 'Initial catalog template release (CAT-003).', '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:07:05.165'),
('8eaaf587-a871-4b9d-ba8a-54e4e38e7234', '8b6a3109-567b-42c2-a9cf-0650c7286fc1', 'v1.0', 'templates/CAT-265/template_CAT-265_v1.0.docx', 'cf99d5e5b3e261b26db6a1791d118256ac906478628c6200915b06b06439548f', 'Published', 'Initial catalog template release (CAT-265).', '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:41:15.701'),
('8f2d0739-761d-4c01-ade2-bfdd100e7001', '08cdaf0b-6dde-4b6a-82ff-7f7b00172ddd', 'v1.0', 'templates/CAT-119/template_CAT-119_v1.0.docx', '07381a5440b87d9b2940814c04886b002a286463fd705f60f2afded91c078823', 'Published', 'Initial catalog template release (CAT-119).', '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:23:37.028'),
('8fe19204-74cd-40be-ae84-fbe2a03a3803', '0093dc0f-9885-4ab2-bc65-260cbe94e516', 'v1.0', 'templates/CAT-021/template_CAT-021_v1.0.docx', 'e01c2498028196a5f38554495d13a96af67c24c30742a8eced7769e45585bd7c', 'Published', 'Initial catalog template release (CAT-021).', '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:10:19.043'),
('9024acc9-4c92-4c96-b980-7c11389d10a9', 'fa291481-ace3-495d-83b2-d2201a034a72', 'v1.0', 'templates/CAT-237/template_CAT-237_v1.0.docx', '13e2a878e8a89da96b613914a6ae1f0c84c33217f8f8d8a6009d0f1cdaa9e617', 'Published', 'Initial catalog template release (CAT-237).', '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:38:02.180'),
('91dfe486-8f7a-471b-a46a-742db2f4e416', 'e2164ecf-8858-45b0-b1f5-b49b3bfb496b', 'v1.0', 'templates/CAT-011/template_CAT-011_v1.0.docx', '99288f257a6f921623eee3437032ce1433a82205765040e28a581cbdca4f1ab4', 'Published', 'Initial catalog template release (CAT-011).', '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:08:30.402'),
('926f9447-7b92-4349-b757-c0132e4f8be6', '0d95d5b9-1a34-4fe7-b6be-2a42cea0f2c5', 'v1.0', 'templates/CAT-035/template_CAT-035_v1.0.docx', '5df2ea3e707a5d6b603c98831683a340bb6dad1010e3a58c419654c00a3f48ca', 'Published', 'Initial catalog template release (CAT-035).', '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:12:29.314'),
('92773fd1-905b-4407-8351-96a284175b55', '41dae77a-815f-4e06-949f-c20fbf08f52d', 'v1.0', 'templates/CAT-139/template_CAT-139_v1.0.docx', 'bacc2b18712005a42797ff82402525f2ada8501091edd266ebd3b527c72c0c15', 'Published', 'Initial catalog template release (CAT-139).', '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:25:52.825'),
('9361319b-c01b-4fd1-93fe-140cea9a86b6', '919d37b4-ce64-4c79-97f5-eb2bbb291799', 'v1.0', 'templates/CAT-263/template_CAT-263_v1.0.docx', '72becdde2cf6cf31828609f84a263122e41341db837606d4fd8151f41af674f6', 'Published', 'Initial catalog template release (CAT-263).', '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:41:02.182'),
('941ada6d-d6b6-4a4e-aef6-310034619304', '934f0a32-65b0-4c9d-876f-27675eea13f0', 'v1.0', 'templates/CAT-254/template_CAT-254_v1.0.docx', 'f192d34330b6c383cd6f699ee76b572cd189e3b6f1f5ebbc13b85327d4f92add', 'Published', 'Initial catalog template release (CAT-254).', '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:40:01.513'),
('94cd0be6-7b2b-46b8-bf0c-2afb31db795c', '96ab1868-47d9-4e48-8ad3-a4272f49403f', 'v1.0', 'templates/CAT-070/template_CAT-070_v1.0.docx', '8ef7dfe5e3cef56ccd4ca2c4790b42711b785ccba02b63910cdb489b851cc0cf', 'Published', 'Initial catalog template release (CAT-070).', '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:17:06.680'),
('94dfbc9b-cc38-442f-801b-f9c7ffc02668', 'e3b64ec2-0f63-4569-96fc-0a3d243280ad', 'v1.0', 'templates/CAT-075/template_CAT-075_v1.0.docx', '5588894648a7b2a9cecf94ab7cd4d24953f7b73e94ef47c81cccd3ecfcc0bf7d', 'Published', 'Initial catalog template release (CAT-075).', '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:17:48.644'),
('956862a8-e05a-49d7-a431-f8d353503fb7', '64e92062-c626-449f-a04a-462455f13737', 'v1.0', 'templates/CAT-144/template_CAT-144_v1.0.docx', '8d12146250ede5e1fc3170cf5953d4e8b5c23c0a54c9d1e07f6f76c796a2844c', 'Published', 'Initial catalog template release (CAT-144).', '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:26:29.801'),
('95774654-8970-47c7-98f5-5b016d390ff1', '9af6671e-815b-4e3e-bbe6-5c59fc6d40d2', 'v1.0', 'templates/CAT-287/template_CAT-287_v1.0.docx', '0976a5641eb1739ee55154339b43000b82cf45d8009675df8dab6e484a5cb5b0', 'Published', 'Initial catalog template release (CAT-287).', '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:44:07.839'),
('9692a5aa-2e76-4c88-bb31-9f2573946b83', '9130ac1b-ec73-4803-9e2c-c0238a63131c', 'v1.0', 'templates/CAT-016/template_CAT-016_v1.0.docx', '1b94cada5e7e593db37b66319e5e62a6843c655ae6a442819b8cf5e0fab15712', 'Published', 'Initial catalog template release (CAT-016).', '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:09:30.940'),
('96e98b6c-5022-4a6a-8538-45dea007ec14', 'd3e2edce-2338-4c21-8831-ea964a8264f8', 'v1.0', 'templates/CAT-174/template_CAT-174_v1.0.docx', '90b473de8b3271a7c11355bd573e5cd6735152cd2763e6926c3a09ad8b037808', 'Published', 'Initial catalog template release (CAT-174).', '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:30:03.286'),
('984370bc-02f5-41d0-b559-2f0031e7ecf0', '83f5943a-6036-4dd9-a198-009c5150773c', 'v1.0', 'templates/CAT-056/template_CAT-056_v1.0.docx', '2228e0f66efd05e1144431c4fe59c9b01d063bac13f6e4e633e3808db920d9ee', 'Published', 'Initial catalog template release (CAT-056).', '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:15:33.591'),
('9ab91dff-b35e-4c69-95a1-880497ac24d3', '1ecad20e-6893-4866-98fc-bf6d74a3f328', 'v1.0', 'templates/CAT-105/template_CAT-105_v1.0.docx', '4eef22c3cbb282669013f10e8b142f311dc4636cc9d1dcbc97e08b04fac4124b', 'Published', 'Initial catalog template release (CAT-105).', '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:21:48.687'),
('9b60b515-2a6b-443d-b1b4-b9be39c9cbff', 'e90390c3-3699-4276-9c48-af213148b688', 'v1.0', 'templates/CAT-296/template_CAT-296_v1.0.docx', '047cd0ad6b6d4a25e7afb074402c00327a137c4d262f1a954ba1fdeabebfb20f', 'Published', 'Initial catalog template release (CAT-296).', '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:45:10.533'),
('9c13214a-1b1c-4a81-98f5-8e7f02c2bb98', '1d9232ac-e585-4692-9519-e5de662b722b', 'v1.0', 'templates/CAT-088/template_CAT-088_v1.0.docx', '5f6079d22f0dd1f8e9320fe294c1871604a8411cdf9c1e4014bdeef4d79c7ba9', 'Published', 'Initial catalog template release (CAT-088).', '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:19:21.787'),
('9c67f9f1-d35c-4140-aa89-9d63475911cb', 'ccb68134-c0b2-4e64-a0e4-32c78da7515b', 'v1.0', 'templates/CAT-235/template_CAT-235_v1.0.docx', '7d20aa95ada04fb9eb7f0440624695463ac47e886f0382b1b0a73f1c3e821f23', 'Published', 'Initial catalog template release (CAT-235).', '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:37:47.374'),
('9f876323-e455-4913-9232-d561ae223b81', '4359ffc0-4a06-4c98-bc56-45af58101b3c', 'v1.0', 'templates/CAT-226/template_CAT-226_v1.0.docx', '6366171c332dd04b0d83e3c49a08d179f3f40f1babf9ea0b5b1fb39971e134ae', 'Published', 'Initial catalog template release (CAT-226).', '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:36:49.099'),
('a0952cf1-1670-4189-8513-382751260037', 'c3e64925-e5bb-4e4e-807f-6d7d8801b09a', 'v1.0', 'templates/CAT-280/template_CAT-280_v1.0.docx', 'db0802af64fab588367e8495fafc6829aa88a31240b6a1f856f975dd56c7c94b', 'Published', 'Initial catalog template release (CAT-280).', '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:43:07.970'),
('a1ae9879-d795-4d25-b0fc-2536ccb1031e', '4a79e9bc-b7a0-4f9a-9684-534d9067b04b', 'v1.0', 'templates/CAT-036/template_CAT-036_v1.0.docx', '947f29eff2ee2f109ea455a190d752d9e351758a61b5dafae461b7d1b25a54c8', 'Published', 'Initial catalog template release (CAT-036).', '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:12:38.790'),
('a25a6d17-8108-426c-84a8-84dddb0d4e14', 'e8789875-398d-4cfe-b84e-934d6369155a', 'v1.0', 'templates/CAT-078/template_CAT-078_v1.0.docx', 'c720ad774b31da6bdd72b89b962cac99501398777dfb036f1072726a47441f50', 'Published', 'Initial catalog template release (CAT-078).', '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:18:08.122'),
('a2db730d-4dbc-4106-919b-fc0360d36f16', '0d7bee95-ad77-4bb4-be91-0e1ae9c0e5cf', 'v1.0', 'templates/CAT-072/template_CAT-072_v1.0.docx', '6e13bd6409d41c8b2cee2183d6968769d64d9d08faab6f928b527f86177bc3ad', 'Published', 'Initial catalog template release (CAT-072).', '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:17:25.046'),
('a5c5977b-441a-4ccb-b7f1-085ce2ccc18f', 'f7287232-e24d-42da-8b7c-f75b312a6138', 'v1.0', 'templates/CAT-163/template_CAT-163_v1.0.docx', '100df9ab74c1d053290f5754eb466ded1a2bb7f0a7c8e4c3045eb2cbfddab3b5', 'Published', 'Initial catalog template release (CAT-163).', '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:28:35.656'),
('a67d6b40-ebe4-4ea6-8415-365ae7961f61', '37733493-a999-4cb4-9bb9-83b79a6dc4ee', 'v1.0', 'templates/CAT-294/template_CAT-294_v1.0.docx', 'ddbe62dccd90add84e0cfe84259c0b42661428f61aae452e3f76316288270891', 'Published', 'Initial catalog template release (CAT-294).', '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:44:55.857'),
('a6c30529-d5fe-4ef6-88f7-5646308ae386', 'aaaeebe6-da02-44fb-8f27-f4b2104b0caa', 'v1.0', 'templates/CAT-177/template_CAT-177_v1.0.docx', 'e5078b8364eae5219a1ca7c8bbd0bdb5055c1be85ac6195468ae193d9a784be3', 'Published', 'Initial catalog template release (CAT-177).', '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:30:28.757'),
('a7792ca7-8658-4169-85b1-dbda0042f131', 'b5a7f4a0-0612-4365-883b-168b64f39655', 'v1.0', 'templates/CAT-232/template_CAT-232_v1.0.docx', '253b8bbc709aadbe8d703879eb84dd4acd0b46a384e252ead51d61febed8e85d', 'Published', 'Initial catalog template release (CAT-232).', '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:37:27.290'),
('a7c0d570-e431-4c48-b4ef-aef8546890ea', 'fa5f881b-d034-4de7-9a69-1361d964f3bf', 'v1.0', 'templates/CAT-069/template_CAT-069_v1.0.docx', '0d9ebd8006584415cc4acbedb5ab1c39437af470684c96d89978582b616a169c', 'Published', 'Initial catalog template release (CAT-069).', '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:16:59.935'),
('a8148ce8-8831-4767-aa6a-677772967a2a', '1cbdc2c6-906f-4b3f-ab9b-01d43376149b', 'v1.0', 'templates/CAT-290/template_CAT-290_v1.0.docx', '662bd13afcc9e6b8a8c72c759cc31c3740fa11f2f722b7d91f3f80a6e819ab42', 'Published', 'Initial catalog template release (CAT-290).', '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:44:28.526'),
('a82ecdb1-9acb-40ed-a3e9-b39f93371ff7', 'be169230-d4d5-46fd-8d39-091ecb4e0dc2', 'v1.0', 'templates/CAT-190/template_CAT-190_v1.0.docx', '764669ba2c23e234a33f5cce88a816293686eb102ea8b28786ee659f7efc9f6d', 'Published', 'Initial catalog template release (CAT-190).', '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:32:16.690'),
('a9155966-0259-44c6-b2d3-e443b4534244', 'e042cb82-7102-47ce-8273-06a55c15e9c9', 'v1.0', 'templates/CAT-125/template_CAT-125_v1.0.docx', 'de24788f0e41ae20608b11ea441c84eb4bec15e93408620a66b1b9d3c4bbe208', 'Published', 'Initial catalog template release (CAT-125).', '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:24:18.065'),
('a967c641-7597-468e-bfa1-bccc3668a316', '55e498aa-131b-420a-bfc7-0220ad1c4f86', 'v1.0', 'templates/CAT-122/template_CAT-122_v1.0.docx', 'f4f510ac62f3a97c16316f9f35e4d1f5b149f835e4667d0b360a463a82b941e3', 'Published', 'Initial catalog template release (CAT-122).', '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:23:57.599'),
('a96ffd2f-f9c7-45bb-ac53-791da9d25353', 'b5bab9e2-0c95-4253-8caa-c62d47faff60', 'v1.0', 'templates/CAT-152/template_CAT-152_v1.0.docx', '446a7ddeae604ce8c036ab64d87bc5598466b6ba36f1f79917024af842daabba', 'Published', 'Initial catalog template release (CAT-152).', '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:27:27.990'),
('aaadd169-b1e0-4879-acd9-7d4901b33831', '804007ee-d19b-40b4-810e-f7a2e4293ba3', 'v1.0', 'templates/CAT-115/template_CAT-115_v1.0.docx', '6e4eeabe3edeac3278e916106777cfd268d8f709ea72b3c6c325b664c2983d31', 'Published', 'Initial catalog template release (CAT-115).', '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:23:06.532'),
('aae04ae9-b293-4539-a12a-781f0d71b8d1', 'e3992c43-80fc-426e-a21d-af8eb9203596', 'v1.0', 'templates/CAT-042/template_CAT-042_v1.0.docx', 'c58d50d337bdf2425b0d03d99fbdca620b0e20dccade15c9bdd30ffa6aac363f', 'Published', 'Initial catalog template release (CAT-042).', '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:13:38.494'),
('aae4c646-eab5-45dd-97ce-81bb12c1077d', '642cb175-b448-4ca4-819e-3093c41b755e', 'v1.0', 'templates/CAT-184/template_CAT-184_v1.0.docx', '1334d71821514ecf7c0e886d8f31773b2d7d6088a3dce9c5d01f5a12b6a47ff1', 'Published', 'Initial catalog template release (CAT-184).', '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:31:24.862'),
('ab0ef57c-1551-4441-b538-de13cf647a2b', 'bb7d06b3-b919-46ad-a288-70991eecfe7e', 'v1.0', 'templates/CAT-012/template_CAT-012_v1.0.docx', '5d552e7c32882a800c4610c3d1170d0f7d4458e1ea4da049e14bbfdf5d18b312', 'Published', 'Initial catalog template release (CAT-012).', '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:08:39.470'),
('ab7e814b-ed5e-4402-8e4e-3c7f1fbae3e7', 'b4ed39bc-5378-4585-a0cb-591ca18c55f5', 'v1.0', 'templates/CAT-269/template_CAT-269_v1.0.docx', '1fe26d8eabe70afb0915edc2e62a8700228fa3f0ed18bf43cedc860fb18c1190', 'Published', 'Initial catalog template release (CAT-269).', '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:41:44.613'),
('abc8d0dd-9195-4d6d-a0b6-0813f8842c54', 'b309d8f0-365d-4413-a177-03f3695dbab2', 'v1.0', 'templates/CAT-204/template_CAT-204_v1.0.docx', '124af5a559fccea1405ff6feeed503dcc42ab563987c0bb0cb68aec014833684', 'Published', 'Initial catalog template release (CAT-204).', '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:34:10.516'),
('ace0b629-cae7-4260-93af-3643d8d3dd58', '09c6585a-8b08-423e-95e2-96304290553a', 'v1.0', 'templates/CAT-116/template_CAT-116_v1.0.docx', '260cdb05e3186053c19c4fea77fef10ed580ec7056885f43a27293da21e8841e', 'Published', 'Initial catalog template release (CAT-116).', '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:23:14.204'),
('ad50cecb-c9da-4316-8604-9bb9c54fe810', '431c09bd-90ad-4beb-9543-21428759b8b8', 'v1.0', 'templates/CAT-192/template_CAT-192_v1.0.docx', '80838c97041915e1164c6c806acc22cd04cdf1f587dbc20e2901055c105aded7', 'Published', 'Initial catalog template release (CAT-192).', '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:32:36.184'),
('b0f8af6b-e459-46d0-849b-c7d88fc13633', '6e4ad68d-1b70-4d87-8d26-a6283ce0ecdb', 'v1.0', 'templates/CAT-129/template_CAT-129_v1.0.docx', '91e8532aec97253ef0e703842ffe3c634cf74f65985e7940c8073e8f1e9b634c', 'Published', 'Initial catalog template release (CAT-129).', '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:24:45.504'),
('b2a1dfa2-e833-452c-8130-04e0b55d4a1d', '1040b9f8-811f-4b1f-8747-3bb996592e8a', 'v1.0', 'templates/CAT-051/template_CAT-051_v1.0.docx', '009ba82f4a9e9e1b6f7405da854083b9be769da7e72a0b516943cec3c4322e20', 'Published', 'Initial catalog template release (CAT-051).', '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:14:52.736'),
('b34abf61-fe95-49b8-810d-c4aca66effd6', 'cfec6c52-0ff2-42e3-bc80-7adfa7d4d7ba', 'v1.0', 'templates/CAT-210/template_CAT-210_v1.0.docx', '64ff13ad5542262149e6ec2cfbdf78c96126fc4ae02458021c592484891cb684', 'Published', 'Initial catalog template release (CAT-210).', '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:34:49.041'),
('b3795800-cd6e-4e96-84d4-f31e28eaab0f', '9fba8d28-c649-420b-9148-b3cc17b152cd', 'v1.0', 'templates/CAT-151/template_CAT-151_v1.0.docx', '19d89650b9c4fa01f14c0a1c3841f18bbe870d2a48bf159e215192b3d57458e8', 'Published', 'Initial catalog template release (CAT-151).', '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:27:22.513'),
('b3fa3129-564d-4926-a813-3f343805c94e', '7b899fe3-f6d8-4459-aa5f-3ecc4ebd1738', 'v1.0', 'templates/CAT-052/template_CAT-052_v1.0.docx', 'df80faaaadb8e0c395f6ce7baa96191710fdc75c54c633a054f01fc448618be0', 'Published', 'Initial catalog template release (CAT-052).', '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:15:02.998'),
('b462c8c5-68e7-491e-886c-59ea27158991', 'd928083d-5036-40e6-ae77-1b21bb7406cb', 'v1.0', 'templates/CAT-141/template_CAT-141_v1.0.docx', '80078345b28c461e73c50b5322633805183db4d194d520a534c907b7f1158102', 'Published', 'Initial catalog template release (CAT-141).', '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:26:05.542'),
('b726e008-8057-43b2-88b6-e77d1b970af8', '95fd09d4-8e6e-47b5-a525-1bfd131fd85c', 'v1.0', 'templates/CAT-059/template_CAT-059_v1.0.docx', 'ab69fb03ec5c7325e1411d2eb96e940d75642ee0c682194a685279f65f54f0c0', 'Published', 'Initial catalog template release (CAT-059).', '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:15:54.643'),
('b74dc6ca-81f6-4b63-8298-1ef27989924a', 'e3da6269-4237-4e10-b5ad-71a2de3a7152', 'v1.0', 'templates/CAT-258/template_CAT-258_v1.0.docx', 'a5dcedf567634c412708cf30e45b1ef5c485f26296caba02d88453bc1125ed9a', 'Published', 'Initial catalog template release (CAT-258).', '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:40:28.195'),
('b849065e-953a-4107-b563-5df696d006f2', 'aedb4eeb-16cf-402a-a4cb-5fd6bd5fd9ee', 'v1.0', 'templates/CAT-054/template_CAT-054_v1.0.docx', '72c07ea1cbefd0e4772e11f03840050dc16e4d412964921223e8219239b889b0', 'Published', 'Initial catalog template release (CAT-054).', '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:15:19.926'),
('b851d494-c520-40cd-a7be-db993a2ea218', '35f0da8a-1625-49cd-b5f4-3e7abf855f47', 'v1.0', 'templates/CAT-004/template_CAT-004_v1.0.docx', 'c4606775777f1bc63995db93b2fc01558b560dc86ef92095c41ea8e23cc2ce89', 'Published', 'Initial catalog template release (CAT-004).', '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:07:16.221'),
('bd5f9e2c-a31a-47ab-98fa-b2098f51e5dd', 'b2bb0ace-6200-4dd8-84ae-d7c5627f62b9', 'v1.0', 'templates/CAT-213/template_CAT-213_v1.0.docx', '77cf1c361ae3cc9f1c204f526358a62e9538cb6b237dc53477b2b94c634db8d9', 'Published', 'Initial catalog template release (CAT-213).', '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:35:14.725'),
('bdbbe799-0966-4ffc-8c57-858e9721bb25', '32585473-cefb-450b-b074-ec44436acc3e', 'v1.0', 'templates/CAT-047/template_CAT-047_v1.0.docx', '5ebb2b6573cf62f4d7cea89d37f4a4d775a319534dd8fa837787c6924ae983c5', 'Published', 'Initial catalog template release (CAT-047).', '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:14:22.018'),
('bdca2373-61f4-4959-92a9-51597dde69c2', 'df00076f-2d6c-4e41-a57e-dc6bcc02534a', 'v1.0', 'templates/CAT-126/template_CAT-126_v1.0.docx', 'c88b42ba147709196662276fb5440de5d56f39ddcef025d6ebe94e81c87b8aef', 'Published', 'Initial catalog template release (CAT-126).', '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:24:25.273'),
('be52925f-f870-4293-bad1-7e3aa928d9b8', 'a52f1641-8eca-4f09-97d6-68c1b549b9e7', 'v1.0', 'templates/CAT-049/template_CAT-049_v1.0.docx', '4dda3420d7912ffbd1b4f9fbd14a443606055d144d0de818faad2ff7dca4abd9', 'Published', 'Initial catalog template release (CAT-049).', '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:14:36.880'),
('bec4931d-f5eb-4ac4-97a7-204023385706', 'ebbe847a-e45b-485d-ba7c-6995642a2aca', 'v1.0', 'templates/CAT-093/template_CAT-093_v1.0.docx', '45612d3b1a51dcca5b012e22325b3647eec03c548e9434b008fb928364debf01', 'Published', 'Initial catalog template release (CAT-093).', '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:20:10.391'),
('bfca17de-bbd6-4c08-92f0-3f99bfb54785', '915cb878-936d-4cea-ae86-7c73f18e64e6', 'v1.0', 'templates/CAT-252/template_CAT-252_v1.0.docx', '0f1d1744c1a769f22977380b68dcb88113338195bf196dc6e5712152d55843cd', 'Published', 'Initial catalog template release (CAT-252).', '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:39:47.060'),
('c09cb221-7da0-4fcd-bc6a-15258f26daf1', '552ab211-9000-4f8c-be4a-00cb35f3a83d', 'v1.0', 'templates/CAT-279/template_CAT-279_v1.0.docx', 'f777027f01c8e8102c5f6c593e91f2b9883d7eb2ebfcbbe678bee2c67243d53a', 'Published', 'Initial catalog template release (CAT-279).', '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:43:00.472'),
('c13d06b7-cb6f-4b97-9815-76bbe6828bf1', 'a02c52f2-2b43-4509-b863-8a2c9b1f4c48', 'v1.0', 'templates/CAT-196/template_CAT-196_v1.0.docx', '642a38555f73e722639d48fd4baa1f0f91eb9b3f21a91c2d2d7b372296f16dff', 'Published', 'Initial catalog template release (CAT-196).', '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:33:09.779'),
('c1df0c28-85dc-454d-a4b5-8cfa6b73fdae', '10204514-84d5-4924-8542-7e24f6143d29', 'v1.0', 'templates/CAT-250/template_CAT-250_v1.0.docx', '0ad3d111232d4073b5bb972627ec7659c2b3f911c58a7c3e20359cf17f27f12d', 'Published', 'Initial catalog template release (CAT-250).', '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:39:35.618'),
('c2303872-a179-4c73-93f2-941c4abcbc6d', 'c9f42ba9-75a6-4060-86db-fed7c849b7a8', 'v1.0', 'templates/CAT-130/template_CAT-130_v1.0.docx', '51c1a600ac50fc71175ab23411976a032faae12d7c855ab2ebef2b6bc067c970', 'Published', 'Initial catalog template release (CAT-130).', '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:24:55.871'),
('c436f021-cecd-4c60-9cba-9fc95cea429c', 'c59581fa-05fb-470d-8673-fd8a8c6bd2e8', 'v1.0', 'templates/CAT-208/template_CAT-208_v1.0.docx', '2ca8f1ca20cfe6715bed38e19783c5b6a6ebae5da8cdad25dc2ef9f5d353b77c', 'Published', 'Initial catalog template release (CAT-208).', '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:34:36.019'),
('c4dad4e6-b06d-4b22-acfe-86fcc2611079', '49979158-6865-42dd-a937-db4f2f20a3a7', 'v1.0', 'templates/CAT-220/template_CAT-220_v1.0.docx', 'b13246819eaa468ff89d645a7fb64fb561a29c33ff7dc4bc548f39972a0352ee', 'Published', 'Initial catalog template release (CAT-220).', '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:36:07.075'),
('c4ec8be5-740c-4049-8d6c-d5e7b3c66983', '283a2dd2-2e77-4466-9919-dc0a1eb6226e', 'v1.0', 'storage/templates/001/template_001_v1.0.docx', '04a0550b812148b5a330eb3d0903da31e53f60928ac007e7b3555f794f3b81f2', 'Published', 'Initial verified master production template release.', '1a1c1f3c-1a81-47aa-bad3-ec5fd76b9730', '2026-11-14 09:29:59.262'),
('c59cf2fd-2725-4f2d-ad2c-f2023addff3e', 'c3fc089d-81d3-4d48-a810-8b3af2746256', 'v1.0', 'templates/CAT-283/template_CAT-283_v1.0.docx', '47a2736e0522b59d565e87d0a1209e48f3d4b0e308957301a734df1c0f18b857', 'Published', 'Initial catalog template release (CAT-283).', '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:43:34.906'),
('c5ce2bf6-f9cf-464a-b12a-e34c4d9749cc', 'fceff328-15ba-4d79-a3bf-d86dd2acc00a', 'v1.0', 'templates/CAT-160/template_CAT-160_v1.0.docx', 'a80fe2959c2ec1d37a3cedced45703b990bfc3eab926d3ee7bf9bbc2740d19fb', 'Published', 'Initial catalog template release (CAT-160).', '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:28:17.723'),
('c64b8f15-6e35-40c5-8c00-789f96d081f5', '84843833-11aa-4709-87ad-1f81ff14f95c', 'v1.0', 'templates/CAT-173/template_CAT-173_v1.0.docx', 'f18727ee740255c04287a75d2867a1575f900d8207d9208ca8b1d7bc8a70205b', 'Published', 'Initial catalog template release (CAT-173).', '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:29:54.499'),
('c69600cd-b146-4522-aa83-5b71a475f133', '3da83698-9663-4a10-9faa-1edaf742b1bd', 'v1.0', 'templates/CAT-131/template_CAT-131_v1.0.docx', '80b019aa1908cc536d9ad0047dda32d4b2173695f8398da6eca2662a2258d82e', 'Published', 'Initial catalog template release (CAT-131).', '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:25:03.045'),
('c74c8d8a-da5f-45a1-b4d9-37382fa0edc7', 'c0289a35-e95a-43d1-9b6f-bbb9dba831ea', 'v1.0', 'templates/CAT-005/template_CAT-005_v1.0.docx', '832bfb78f2a61006106ffdf3f4f22dd6abe3f78b29d72f73a5eed0d8d6c2bcac', 'Published', 'Initial catalog template release (CAT-005).', '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:07:28.820'),
('c77fdadd-a9dd-4297-a2c5-a67b52493e36', '03c12606-60df-4522-9ce8-798b0751f27e', 'v1.0', 'templates/CAT-300/template_CAT-300_v1.0.docx', '1288431b3ffe174b68de16bef5639d12254f924a8c7e5d81b32f5c2b99bd706d', 'Published', 'Initial catalog template release (CAT-300).', '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:45:35.888'),
('c817370e-6a7c-4971-9a06-d1d243a3249e', '14a16855-4d02-4590-904d-ccd58a36d35e', 'v1.0', 'templates/CAT-074/template_CAT-074_v1.0.docx', '50f051c2f464759dcb4da692f554c412bd78fcc910334fd51a505f7813484939', 'Published', 'Initial catalog template release (CAT-074).', '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:17:41.650'),
('c8e2f1fe-5365-44b5-a497-437d71a02c2d', 'bb217cbb-acd0-4a4d-b050-7cdc4d578d85', 'v1.0', 'templates/CAT-143/template_CAT-143_v1.0.docx', '12b8f8953c6fb2ccc1454527ed00cadfeda294729e69fa4d44bba9b19248ba80', 'Published', 'Initial catalog template release (CAT-143).', '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:26:22.331'),
('c968ff58-b7bc-4390-a9ce-e07e8f62d618', '8cd3fab1-1c12-41c5-9571-5b4f3ab10d14', 'v1.0', 'templates/CAT-164/template_CAT-164_v1.0.docx', '889edb697246d200fef95dd2ba27dd7171acdc912f56d3c0b85f668702393f9d', 'Published', 'Initial catalog template release (CAT-164).', '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:28:41.155'),
('cc5d287b-035c-4bbb-8ad8-7cc0051ffb46', '463ac23f-2bdb-4f83-90c3-f7ed9b149ac2', 'v1.0', 'templates/CAT-180/template_CAT-180_v1.0.docx', '473ba97c577ca01a2bdc653ddf2c94dfc8dd0a98f6f8d9f689826db9fde221cf', 'Published', 'Initial catalog template release (CAT-180).', '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:30:52.249'),
('cca756c1-e79e-4d0f-9f90-2b03eac1cbe1', '9f032c21-ffc9-4f99-8051-3fb661f63515', 'v1.0', 'templates/CAT-039/template_CAT-039_v1.0.docx', 'dba4f47d66f0509f9df56f46771e9948dd409654f8ec6aac9ca3a3dc27c93bb2', 'Published', 'Initial catalog template release (CAT-039).', '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:13:05.421'),
('cda60690-b708-484d-b818-da492d1ec9f4', 'fd8741e6-b147-4092-b506-fce5d80b15bb', 'v1.0', 'templates/CAT-092/template_CAT-092_v1.0.docx', '624e72275d4aebc9c24df189d4660717f9ee46c69e62da61089ebab0d1bc67ef', 'Published', 'Initial catalog template release (CAT-092).', '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:20:00.458'),
('cf3f8036-b51a-4805-9815-f7e0ab87f802', 'fc1a39b3-f4d4-4967-aee7-82759812ee0a', 'v1.0', 'templates/CAT-132/template_CAT-132_v1.0.docx', '6535198102446f9ee04b89ba6458f6c2d1ff640f8092949b08a01eaeefc22507', 'Published', 'Initial catalog template release (CAT-132).', '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:25:10.406'),
('d220f2ef-879d-4a4c-baa4-9701c3f16d60', '889c3da1-d927-44a4-98b6-00f7f8cee384', 'v1.0', 'templates/CAT-096/template_CAT-096_v1.0.docx', 'd38a5eebd01be693359f228a8ea20bdc9e077c79bd4bbb6d5a84e27273e95891', 'Published', 'Initial catalog template release (CAT-096).', '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:20:32.818'),
('d24a965c-788a-4dc5-93f8-b25f2bcc6604', '9a5083a6-7aac-498a-b816-c5989c4bbe74', 'v1.0', 'templates/CAT-057/template_CAT-057_v1.0.docx', '778a30349c917e1890620e2dd3fbf07908fcfdd7137e35c16162ab995293dcdc', 'Published', 'Initial catalog template release (CAT-057).', '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:15:39.655'),
('d24c9473-cba3-4708-a4ef-3e4fb5ed825c', '31ad4e4e-c275-400f-9fb2-525090e88ac5', 'v1.0', 'templates/CAT-241/template_CAT-241_v1.0.docx', '4083e04e4943ef5d77b4a836aa9777c8ea7f0bc255b2725817853a6c63903cfe', 'Published', 'Initial catalog template release (CAT-241).', '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:38:28.453'),
('d25581db-9683-4af4-be68-eb539366297e', 'cc32036f-db71-4c1e-a1cd-3c0e1866686d', 'v1.0', 'templates/CAT-028/template_CAT-028_v1.0.docx', '7c7b083eb217099ac90aa53a546d2f01647aba02015fa1d87c4370e355b5c502', 'Published', 'Initial catalog template release (CAT-028).', '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:11:28.516'),
('d26b2d0a-875b-440e-bdd0-98d209b395f6', 'c2ccd2d2-9a66-4d88-9d2d-d02da2b9e12d', 'v1.0', 'templates/CAT-106/template_CAT-106_v1.0.docx', 'b3f306511a38f20d443c22f41e973ef04185092ea29a484c0306b65cdde82501', 'Published', 'Initial catalog template release (CAT-106).', '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:21:57.086'),
('d37ef01a-3309-47ed-99fd-c75e91b05574', 'a5abbe7f-a73c-46d1-8afd-f256708c44b1', 'v1.0', 'templates/CAT-095/template_CAT-095_v1.0.docx', '160484a06c9dec73a2f6906e69acd98d8f86311c46ba2772c78fa768af7598a2', 'Published', 'Initial catalog template release (CAT-095).', '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:20:26.060'),
('d4dbbe74-9882-4019-a375-d6771172c7ce', '4a78e072-441a-4bea-9184-099efeff86f7', 'v1.0', 'templates/CAT-146/template_CAT-146_v1.0.docx', '19ff0d0c3d27f6b248b1f7793fc2f4e9e39078f0dcfc150c1be35ff71fa0b479', 'Published', 'Initial catalog template release (CAT-146).', '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:26:44.761'),
('d51ef237-53a6-4724-a58f-1620a49a6b25', '5c7dedf1-567b-49b3-bd08-fc976754a23c', 'v1.0', 'templates/CAT-097/template_CAT-097_v1.0.docx', 'c3e3a485b74865de0ebd2114bb1825b5e3382b6bdf880ae944ef9e0f1311136a', 'Published', 'Initial catalog template release (CAT-097).', '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:20:40.792'),
('d534334f-ffd5-4c0f-891f-4361aeabdccb', '491f1a6f-0f0d-446e-9d06-4806cc2fa2b0', 'v1.0', 'templates/CAT-048/template_CAT-048_v1.0.docx', 'd883fc2d277fac9eb738159a1603569ad748c3d014dc0c061ae078cb2e09da1b', 'Published', 'Initial catalog template release (CAT-048).', '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:14:29.395'),
('d554bfda-8bce-4121-a8fa-a94f5da56ba5', '4fe35276-a499-47c1-85aa-8a20f4bf9a93', 'v1.0', 'storage/templates/096/template_096_v1.0.docx', 'fa347ed955907cfd6bdaf1740719c701032cd00314ebd7a486f8efb8f9be975d', 'Published', 'Initial verified master production template release.', '1a1c1f3c-1a81-47aa-bad3-ec5fd76b9730', '2026-11-14 09:29:36.759'),
('d6d12dd8-f5fc-4ea7-947f-a57f919d757f', '4ce12433-32c5-4583-a496-401178fa26aa', 'v1.0', 'templates/CAT-071/template_CAT-071_v1.0.docx', '3f9a7e6488645081b918a0f5a2920a8c6f6683364622f359ce31a1dbe2b823d6', 'Published', 'Initial catalog template release (CAT-071).', '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:17:16.922'),
('d795264a-186b-4ff7-90ce-a6483dbb71ee', '09bca63a-1776-4d61-8285-1039767c58c5', 'v1.0', 'templates/CAT-271/template_CAT-271_v1.0.docx', '8f579c8b5cfd2fa75bbefbefd4c1fc663eaedb61649a234aa069472791de3c14', 'Published', 'Initial catalog template release (CAT-271).', '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:42:01.887'),
('d7c3f728-e7aa-4abb-82e1-b77e855808b2', '9b1a25a8-2f13-4b44-a1b2-202f406519d7', 'v1.0', 'templates/CAT-224/template_CAT-224_v1.0.docx', '708669928f48d0141124fd028af5d85c8d8529fa704f651b816e750f7971f96f', 'Published', 'Initial catalog template release (CAT-224).', '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:36:33.810'),
('d9c65b2f-6e94-46e1-81c0-92616ad8d297', 'ff9e1bb4-a6d9-4ef7-a99d-d9b2244e7ed2', 'v1.0', 'templates/CAT-026/template_CAT-026_v1.0.docx', 'ac084245ce76cc9466bc145a6408c7784dbe49f16a88f66fb08c6430c9be51bd', 'Published', 'Initial catalog template release (CAT-026).', '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:11:06.672'),
('dd990efc-d55c-4258-9f99-222b61fea6f9', 'a7f5e972-f097-4c66-ab84-74331b79562f', 'v1.0', 'templates/CAT-022/template_CAT-022_v1.0.docx', '7ad57612208544dc0e5dc14020d3a7b27374badf75c8f5227696f7b7432668fb', 'Published', 'Initial catalog template release (CAT-022).', '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:10:27.131'),
('df3e25c5-5690-4157-99b0-8313f33d326b', '8182054e-ac97-419f-882f-7a7d0bb82c77', 'v1.0', 'templates/CAT-110/template_CAT-110_v1.0.docx', '1b4a2ff970783a7d18fe976b1c7d242913596bff636f7be4d2f6e77a062a622a', 'Published', 'Initial catalog template release (CAT-110).', '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:22:27.806'),
('e156defb-48fa-424a-9036-9fbb2c624c41', 'f8ad167d-3d8a-45a7-952b-e58d87bdf917', 'v1.0', 'templates/CAT-120/template_CAT-120_v1.0.docx', '86595d54d58f3131f0f460829151e3b7d2ef15a0b706f6d6fadc683695e5d8db', 'Published', 'Initial catalog template release (CAT-120).', '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:23:43.289'),
('e157fff3-b830-4744-a7ea-4f78cc3f88ee', 'ba416e5e-46a2-4a60-a9ed-646edcdb2c1f', 'v1.0', 'templates/CAT-073/template_CAT-073_v1.0.docx', 'b95094b65e6e138629473ad7ae283695536d7d9cf98e22ceda03dfa12499011c', 'Published', 'Initial catalog template release (CAT-073).', '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:17:33.084'),
('e4b91c44-5bb0-4497-85c2-1ea00f432aca', 'dc964f6b-2777-4014-af87-fcffadd26ea7', 'v1.0', 'templates/CAT-284/template_CAT-284_v1.0.docx', '5dab264e48300e88e710cc66ddfd21013adbb36a379f61eae41deb2abef87323', 'Published', 'Initial catalog template release (CAT-284).', '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:43:42.925'),
('e69186ac-46bc-4fea-82bf-e9bd834342ac', 'dae226c0-51ff-44b6-8496-952c5ab8152f', 'v1.0', 'templates/CAT-053/template_CAT-053_v1.0.docx', '02c0b928c353e8714ce9ac05b1fc98f9e879c286da4220afb1a7a158b96f0cc7', 'Published', 'Initial catalog template release (CAT-053).', '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:15:11.521'),
('e6cf600c-080d-42b6-a561-f64fb49f23ac', 'df953e4a-ba2c-434d-99d3-9d5325670e1c', 'v1.0', 'storage/templates/115/template_115_v1.0.docx', 'aaa76667601753e155d41c1df07ec4e6bc32a79269d6dddd9c9003cdf16e8c63', 'Published', 'Initial verified master production template release.', '1a1c1f3c-1a81-47aa-bad3-ec5fd76b9730', '2026-11-14 09:29:54.406'),
('e7250e39-5976-4061-9be3-c776a91a40d3', 'c773d52b-f4d7-4a8b-af0b-4c08c8c35137', 'v1.0', 'templates/CAT-149/template_CAT-149_v1.0.docx', '3a0d11e4a3284a105bb7d5207359d5e216b4e9e7b7722dccfdc1a6ddf6e6be23', 'Published', 'Initial catalog template release (CAT-149).', '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:27:08.713'),
('e7b63652-7194-4fd0-923c-6e5cc1cc7975', 'fff106b1-aded-405a-ad65-04e2572ac2e9', 'v1.0', 'templates/CAT-124/template_CAT-124_v1.0.docx', '495f2a30947aa6a9d97682a8a7a368a368d48edfdd3b90e0db99b78a729084f7', 'Published', 'Initial catalog template release (CAT-124).', '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:24:10.646'),
('eaf9c42d-fa49-4e7f-97e9-106ed7ac79ba', '88138846-d949-40d0-b990-be51bd4172cb', 'v1.0', 'templates/CAT-034/template_CAT-034_v1.0.docx', 'eb02d9b362d4b97ffec91bcf414546f3ffe106d10dcd7b262506b5b54eee3aad', 'Published', 'Initial catalog template release (CAT-034).', '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:12:19.440'),
('eb02f6e2-eb95-476b-9f3a-0012c5e69de4', 'db858b5a-8b15-43ca-9670-ad16f6a562cf', 'v1.0', 'templates/CAT-236/template_CAT-236_v1.0.docx', 'ae0dd861db0ab3de807b492e66f45407e092ee555b95324e8cb59493177141df', 'Published', 'Initial catalog template release (CAT-236).', '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:37:55.738'),
('eb6ab9da-aa7c-44b0-93d2-47e002eefd78', '26c5b56f-735a-46f6-a451-5d62f8943029', 'v1.0', 'templates/CAT-103/template_CAT-103_v1.0.docx', '25f68e09a9a984fc3c4aa77653a202d5d874eda50b5a91c4e032ecb022f9f3be', 'Published', 'Initial catalog template release (CAT-103).', '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:21:31.807'),
('ec1c0e31-fed1-4081-9ec7-c1588deef41e', '46582f64-d35c-4f14-b04b-9dd04a3bae31', 'v1.0', 'templates/CAT-218/template_CAT-218_v1.0.docx', '42f09c6b295b5cfd8f7c7c3749cef37e97fe2d8aad529fd865b80c6bcb23b4f4', 'Published', 'Initial catalog template release (CAT-218).', '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:35:52.189'),
('ed751d5b-ec83-4cc5-a512-32cd82650602', '1dc2a79c-772d-4565-a4c1-2c45fda093e1', 'v1.0', 'templates/CAT-270/template_CAT-270_v1.0.docx', '00a5cd1362c2d19718a11b156cb6c7b3ad2464acd430fd77862f5a47972f26d0', 'Published', 'Initial catalog template release (CAT-270).', '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:41:49.879'),
('ee7a648c-6b21-4a0f-bdc7-1f83084301aa', 'b2ef4f4b-c4fa-493b-b3c7-9f22005c81e7', 'v1.0', 'templates/CAT-128/template_CAT-128_v1.0.docx', 'd84ecabbe7a212deb956bfd707ff0f11a5182f652ea8f566b85b940719920552', 'Published', 'Initial catalog template release (CAT-128).', '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:24:36.756'),
('ef31a912-5c20-4e9e-b072-8a9062cf43b5', '34081a3e-beca-4f7d-9bd7-e3245f37386b', 'v1.0', 'templates/CAT-187/template_CAT-187_v1.0.docx', 'ffee19148ce9618d7410e6a8e735d987be8a0a7aae91acad4534cfb1962f0d52', 'Published', 'Initial catalog template release (CAT-187).', '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:31:52.621'),
('ef522887-592a-4660-91a0-efe24715406f', 'd600b6d6-1a87-4b1c-a1f6-63d81570b1fd', 'v1.0', 'templates/CAT-017/template_CAT-017_v1.0.docx', '3136630010919f344bbc7ac1c89bdcb47607a970dc2c318d3230bb4009c72071', 'Published', 'Initial catalog template release (CAT-017).', '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:09:43.379'),
('f0166dee-f985-4d9b-b2de-6cfe1f8ad7d3', 'cdc1fc7f-6b0d-48c7-87bc-f24fedb78e14', 'v1.0', 'templates/CAT-002/template_CAT-002_v1.0.docx', '2814dcb9d1baa7211af31e9472ee8fbaf89e088ccb5e2b0195ddbbb0d30ff68e', 'Published', 'Initial catalog template release (CAT-002).', '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:06:57.490'),
('f044998e-94c8-4a24-8776-9ffddfc146af', '32aba23d-c372-40be-bfd3-cc5314edbbfb', 'v1.0', 'templates/CAT-261/template_CAT-261_v1.0.docx', 'd12afd424168ecb4798bcf4ac880a5b6c0c2bb0681fddc6f2b0d609b50dcfed9', 'Published', 'Initial catalog template release (CAT-261).', '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:40:49.866'),
('f0f60427-2e97-4056-bd3a-cf9f245eae61', '61b7a486-8769-4db8-826c-5559c35d9de7', 'v1.0', 'templates/CAT-244/template_CAT-244_v1.0.docx', '4afadc2477624c48d947f8ee3ac157542dd2bf3b22920d8fbd7c4e9d6b6f762d', 'Published', 'Initial catalog template release (CAT-244).', '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:38:53.675'),
('f1ae8218-aa51-4131-8ef6-0c719f6c8747', 'a6321023-eea0-4702-9574-d19cc9ff01aa', 'v1.0', 'templates/CAT-043/template_CAT-043_v1.0.docx', '0841c3d73435aa061093ff4614538b5c6e0f3a329d95d8b11c9c77aea88bb460', 'Published', 'Initial catalog template release (CAT-043).', '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:13:47.034'),
('f1b41b5d-de04-4418-85e1-9788310606e7', 'f1abecae-695f-45bd-bcf8-979d243239a7', 'v1.0', 'templates/CAT-170/template_CAT-170_v1.0.docx', 'b317982ae0253ddd41cd4ad500b88a824731353948e78d0a5610cac9a06a657c', 'Published', 'Initial catalog template release (CAT-170).', '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:29:24.130'),
('f1d31e7b-171b-4abc-85e6-4bfd9332fa65', '82d1d761-13dd-4515-b34b-00b80e2fa423', 'v1.0', 'templates/CAT-216/template_CAT-216_v1.0.docx', 'ea68b55c2f997e38c50e5789fe760ad1bdebb9df520dfb68f557c7d905ede645', 'Published', 'Initial catalog template release (CAT-216).', '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:35:38.301'),
('f1de25a4-0c3e-4065-8ed5-d194d16ccebd', 'edf21ab2-3e28-4ddd-afb0-81e489140627', 'v1.0', 'templates/CAT-077/template_CAT-077_v1.0.docx', '91424e4c8759da754615a7066da9067a5e85b2d450f81bd892a065a8580534e6', 'Published', 'Initial catalog template release (CAT-077).', '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:18:01.776'),
('f3c5d700-e6d6-4bf5-ab31-1e450d09a991', '1bb31b5d-a533-469a-84ef-1ba71a09b612', 'v1.0', 'templates/CAT-079/template_CAT-079_v1.0.docx', '01569967d250c06badd93ae8dfa1df39950e5525039b8b4811a4995038930a5c', 'Published', 'Initial catalog template release (CAT-079).', '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:18:14.290'),
('f512924e-1ce1-4f7c-8a32-1b102bed96b8', '79ff6e5e-2416-4a6d-97ff-8d7376794622', 'v1.0', 'templates/CAT-104/template_CAT-104_v1.0.docx', '109897c9e1dd389142adcc039742667576b17290372f5d5890f7d5307178a27c', 'Published', 'Initial catalog template release (CAT-104).', '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:21:39.574'),
('f55f9f4b-1665-4b30-acba-b249d2a03da2', '1a66b1f9-e5f1-4138-9852-9f45bc2741c3', 'v1.0', 'templates/CAT-292/template_CAT-292_v1.0.docx', 'b61c0fb30a03b87b05bf81a1f4e67296c9467cfbd0c93bf278c63770f70c50b6', 'Published', 'Initial catalog template release (CAT-292).', '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:44:42.548'),
('f57ee915-26c8-4404-b8af-6a03e2a7cb59', '6867ff26-def9-4eca-835d-7e30515cb997', 'v1.0', 'templates/CAT-260/template_CAT-260_v1.0.docx', '479112f5fce280a3772bee13fe8d1cae84e6171f3e133076c2f09739689ae3a1', 'Published', 'Initial catalog template release (CAT-260).', '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:40:41.743'),
('f5baa4d4-c567-40bb-a6da-9bc4cd478cb2', 'b1d7a59d-d48e-4c6c-b763-2f7dc300c424', 'v1.0', 'templates/CAT-176/template_CAT-176_v1.0.docx', '75274ff91ff4f55a1fba819e98c1975dce4b290361d2eef189105df1a5e60215', 'Published', 'Initial catalog template release (CAT-176).', '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:30:20.873'),
('f6f0f444-c32f-4188-943b-0ba2dcb10cd4', '61b207a4-ab85-48ec-b090-184567211d9c', 'v1.0', 'templates/CAT-203/template_CAT-203_v1.0.docx', '62514000505adb5d8d8d28fdeecffbd7e4a194ddc5c9b494ea70e79bcf93afb7', 'Published', 'Initial catalog template release (CAT-203).', '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:34:04.500'),
('f9b4e048-4705-4414-a181-411253453bf6', 'b99ff5a3-007f-4ac6-b14c-c940f0d4cbd1', 'v1.0', 'templates/CAT-117/template_CAT-117_v1.0.docx', 'cc38dfd682711a90c698f08e01265331a3742dcd24061381077232ff2ef3dfbe', 'Published', 'Initial catalog template release (CAT-117).', '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:23:20.542'),
('fb08ce84-4c18-4837-b721-a23609d55a88', '05dd346b-aa51-4409-98ad-573bf92e199f', 'v1.0', 'templates/CAT-007/template_CAT-007_v1.0.docx', 'dbc24977077579033a2245ad0bb9b11dcb1a6c9c4e316ba31ed99e77f6ebd713', 'Published', 'Initial catalog template release (CAT-007).', '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:07:54.843');
INSERT INTO `template_versions` (`id`, `template_id`, `version_number`, `docx_storage_key`, `sha256_checksum`, `status`, `change_summary`, `created_by_user_id`, `created_at`) VALUES
('fb67f315-9816-4b39-a52a-f04d70347eb8', '9f5f0b07-905a-4f4c-b61d-e6fda47d7f15', 'v1.0', 'templates/CAT-275/template_CAT-275_v1.0.docx', 'cde37c0b6c5c5de143257cf2c9ee812255a0d2dd6dd1170c96f4714675b2d36d', 'Published', 'Initial catalog template release (CAT-275).', '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:42:30.175'),
('fd5a203a-5e69-48fa-b56e-5f807c102f1f', '4c3d4e11-98b3-4da8-a203-05acf891183b', 'v1.0', 'templates/CAT-108/template_CAT-108_v1.0.docx', '60032eddb6e450d3043513b48873175aa1b8081e1d782722d62c9924eced9123', 'Published', 'Initial catalog template release (CAT-108).', '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:22:11.842'),
('fdcaea3e-57f2-40dd-ad96-ec8882510a85', '01ae7515-b7ce-4564-a90b-f218fad041dd', 'v1.0', 'templates/CAT-168/template_CAT-168_v1.0.docx', 'fc8c70470b28510ab52ec4fe2eb2233b963867ff5cde7a85820ce40a521ae358', 'Published', 'Initial catalog template release (CAT-168).', '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:29:08.687'),
('fe7b7db2-ab5b-4c22-bbd9-6c48fb296c01', '59a6f13c-1633-41ab-9048-aa5d5a6ac19c', 'v1.0', 'templates/CAT-133/template_CAT-133_v1.0.docx', '23aabe6e51cff0f6b5183826502d452d794a0dbe3d7e761938a803c986137d73', 'Published', 'Initial catalog template release (CAT-133).', '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:25:15.933'),
('ffd84a63-15dd-4736-ac53-3cdf07c061d1', '2d18751d-7e43-4152-92b0-4bcbc42f2e14', 'v1.0', 'templates/CAT-001/template_CAT-001_v1.0.docx', 'd2e5e334ce91e57160abc66dd62ed31cf76875106a4202b12999c253545e2591', 'Published', 'Initial catalog template release (CAT-001).', '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-25 09:06:41.631');

-- --------------------------------------------------------

--
-- Table structure for table `three_way_reconciliations`
--

CREATE TABLE `three_way_reconciliations` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `reconciliation_month` varchar(7) COLLATE utf8mb4_unicode_ci NOT NULL,
  `bank_statement_balance` decimal(12,2) NOT NULL,
  `deposits_in_transit` decimal(12,2) NOT NULL DEFAULT '0.00',
  `outstanding_checks` decimal(12,2) NOT NULL DEFAULT '0.00',
  `adjusted_bank_balance` decimal(12,2) NOT NULL,
  `gl_trust_liability_balance` decimal(12,2) NOT NULL,
  `client_subledgers_total_balance` decimal(12,2) NOT NULL,
  `reconciliation_variance` decimal(12,2) NOT NULL,
  `is_balanced` tinyint(1) NOT NULL,
  `audited_by_user_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `audit_certificate_pdf_url` text COLLATE utf8mb4_unicode_ci,
  `reconciled_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `time_entries`
--

CREATE TABLE `time_entries` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `entry_code` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `matter_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `date` date NOT NULL,
  `hours` decimal(5,2) NOT NULL,
  `rate` decimal(10,2) NOT NULL,
  `amount` decimal(12,2) NOT NULL,
  `activity_type` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `activity_code` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_billable` tinyint(1) NOT NULL DEFAULT '1',
  `status` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Submitted',
  `approved_by_user_id` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `approved_at` datetime(3) DEFAULT NULL,
  `rejection_comment` text COLLATE utf8mb4_unicode_ci,
  `exported_to_cosmolex` tinyint(1) NOT NULL DEFAULT '0',
  `export_batch_id` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `trial_notebook_items`
--

CREATE TABLE `trial_notebook_items` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `litigation_case_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `section` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `admissibility` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `order_index` int NOT NULL DEFAULT '0',
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `trust_sub_ledgers`
--

CREATE TABLE `trust_sub_ledgers` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `ledger_code` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `client_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `matter_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `balance` decimal(12,2) NOT NULL DEFAULT '0.00',
  `last_audit_date` date NOT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL
) ;

--
-- Dumping data for table `trust_sub_ledgers`
--

INSERT INTO `trust_sub_ledgers` (`id`, `ledger_code`, `client_id`, `matter_id`, `balance`, `last_audit_date`, `created_at`, `updated_at`) VALUES
('12d33167-f29e-4895-9dce-8eeb34d816ca', 'TRU-26-0001', 'b23414a1-b309-44c9-8097-bb3fc368222d', 'fdefc7e3-861c-4838-a38a-f580b6c59e8b', 1000.00, '2026-11-16', '2026-11-16 12:29:13.918', '2026-11-16 12:29:13.951');

--
-- Triggers `trust_sub_ledgers`
--
DELIMITER $$
CREATE TRIGGER `trg_prevent_subledger_negative_balance` BEFORE UPDATE ON `trust_sub_ledgers` FOR EACH ROW BEGIN
             IF NEW.balance < 0.00 THEN
                 SIGNAL SQLSTATE '45000'
                 SET MESSAGE_TEXT = 'IOLTA Violation (Utah RPC 1.15): Trust subledger balance cannot be negative.';
             END IF;
         END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `trust_transactions`
--

CREATE TABLE `trust_transactions` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `trust_sub_ledger_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `transaction_type` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `amount` decimal(12,2) NOT NULL,
  `running_balance` decimal(12,2) NOT NULL,
  `source_reference` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `authorized_by_user_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `purpose` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `trust_transactions`
--

INSERT INTO `trust_transactions` (`id`, `trust_sub_ledger_id`, `transaction_type`, `amount`, `running_balance`, `source_reference`, `authorized_by_user_id`, `purpose`, `created_at`) VALUES
('ca6def6e-f315-4c45-be85-4970f65a5afb', '12d33167-f29e-4895-9dce-8eeb34d816ca', 'Deposit', 1000.00, 1000.00, 'Wire Transfer / Client Retainer', '66c97d44-096b-4d34-8bd1-5691ba855e23', 'Retainer deposit to trust account', '2026-11-16 12:29:13.934');

--
-- Triggers `trust_transactions`
--
DELIMITER $$
CREATE TRIGGER `trg_prevent_trust_overdraft` BEFORE INSERT ON `trust_transactions` FOR EACH ROW BEGIN
             IF NEW.running_balance < 0.00 THEN
                 SIGNAL SQLSTATE '45000'
                 SET MESSAGE_TEXT = 'IOLTA Violation (Utah RPC 1.15): Trust transaction running balance cannot be negative.';
             END IF;
         END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `unmatched_communications`
--

CREATE TABLE `unmatched_communications` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `sender_name` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `sender_email` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `contact_number` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `subject` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `preview` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `received_at` datetime(3) NOT NULL,
  `suggested_client_id` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `suggested_matter_id` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `suggested_client_name` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `suggested_matter_label` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `matching_status` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Unmatched',
  `review_notes` text COLLATE utf8mb4_unicode_ci,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `uscis_receipts`
--

CREATE TABLE `uscis_receipts` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `immigration_case_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `receipt_number` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `form_type` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `filing_date` date NOT NULL,
  `notice_date` date DEFAULT NULL,
  `service_center` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `current_status` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Case Was Received',
  `biometrics_date` datetime(3) DEFAULT NULL,
  `rfe_due_date` date DEFAULT NULL,
  `interview_date` datetime(3) DEFAULT NULL,
  `decision_date` date DEFAULT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_code` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password_hash` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `role` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `title` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `initials` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL,
  `department` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `billing_rate` decimal(10,2) NOT NULL DEFAULT '0.00',
  `status` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Active',
  `mfa_enabled` tinyint(1) NOT NULL DEFAULT '0',
  `mfa_secret` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `last_login_at` datetime(3) DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `user_code`, `name`, `email`, `password_hash`, `phone`, `role`, `title`, `initials`, `department`, `billing_rate`, `status`, `mfa_enabled`, `mfa_secret`, `last_login_at`, `created_at`, `updated_at`) VALUES
('1a1c1f3c-1a81-47aa-bad3-ec5fd76b9730', 'USR-002', 'Thomas Bludworth, Esq.', 't.bludworth.1794562683052@utahslawyers.com', '$2b$12$nCNTzPdqLSeqCwvcgyo7s.vY/lWPLRDRRI7WYgHMsPzZE5q0uFo6O', NULL, 'attorney', 'Litigation Partner', 'TBE', 'Civil Litigation', 500.00, 'Active', 0, NULL, '2026-11-13 09:38:05.131', '2026-11-13 09:38:03.612', '2026-11-13 09:38:05.140'),
('66c97d44-096b-4d34-8bd1-5691ba855e23', 'USR-001', 'Eleanor Heugly, Esq.', 'e.heugly@utahslawyers.com', '$2b$12$NyKz7nSTzrX.2dz3BrHZiu/PXvkXqUKtRn94Iraq8uKF3c9Kjmf22', NULL, 'super_admin', 'Managing Partner', 'EH', 'Executive Management', 650.00, 'Active', 0, NULL, '2026-11-26 04:57:38.869', '2026-11-13 09:37:40.346', '2026-11-26 04:57:38.875'),
('8640f71a-0142-42f4-a4c0-732537dcd9b7', 'USR-004', 'Thomas Bludworth, Esq.', 't.bludworth@utahslawyers.com', '$2b$12$u0f5IvLrNJ0QYrWyK.uStOqWd3aD0wpH8F1iNtuU8vxbIbr7.4JD6', NULL, 'attorney', 'Litigation Partner', 'TB', 'Civil Litigation', 550.00, 'Active', 0, NULL, '2026-11-26 05:32:43.147', '2026-11-14 07:02:30.578', '2026-11-26 05:32:43.149'),
('a0b374d7-a8b4-4d42-b4c1-909094f4598b', 'USR-006', 'Marcus Vance', 'm.vance@utahslawyers.com', '$2b$12$u0f5IvLrNJ0QYrWyK.uStOqWd3aD0wpH8F1iNtuU8vxbIbr7.4JD6', NULL, 'paralegal', 'Litigation Paralegal', 'MV', 'Litigation Support', 175.00, 'Active', 0, NULL, '2026-11-16 10:07:18.180', '2026-11-14 07:02:30.607', '2026-11-16 10:07:18.182'),
('af3744b3-df06-4041-bc27-b8d16a8903d7', 'USR-003', 'Thomas Bludworth, Esq.', 't.bludworth.1794562768462@utahslawyers.com', '$2b$12$061n6q85.cDUyTwuO/eUwuHQMRfGxXxtZmFdRI99YBTTuWfKCGP0K', NULL, 'attorney', 'Litigation Partner', 'TBE', 'Civil Litigation', 500.00, 'Inactive', 0, NULL, '2026-11-13 09:39:30.213', '2026-11-13 09:39:28.862', '2026-11-16 11:58:45.905'),
('b4144e13-e1b8-4c10-bc62-3ca0966380e0', 'USR-007', 'Rachel Adams', 'r.adams@utahslawyers.com', '$2b$12$u0f5IvLrNJ0QYrWyK.uStOqWd3aD0wpH8F1iNtuU8vxbIbr7.4JD6', NULL, 'billing', 'Trust Accountant', 'RA', 'Finance & Escrow', 150.00, 'Inactive', 0, NULL, '2026-11-16 10:04:39.571', '2026-11-14 07:02:30.615', '2026-11-16 11:59:02.920'),
('eca5d99f-a1cd-43f8-82f2-830acd1a5ddc', 'USR-005', 'David Sterling, Esq.', 'd.sterling@utahslawyers.com', '$2b$12$u0f5IvLrNJ0QYrWyK.uStOqWd3aD0wpH8F1iNtuU8vxbIbr7.4JD6', NULL, 'supervisor', 'Review Counsel', 'DS', 'Practice Management', 400.00, 'Active', 0, NULL, '2026-11-19 05:31:40.865', '2026-11-14 07:02:30.600', '2026-11-19 05:31:40.866');

-- --------------------------------------------------------

--
-- Table structure for table `workflow_stages`
--

CREATE TABLE `workflow_stages` (
  `id` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `practice_area_id` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `stage_name` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `stage_code` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `stage_order` int NOT NULL,
  `required_fields` json NOT NULL,
  `auto_tasks` json NOT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1'
) ;

--
-- Dumping data for table `workflow_stages`
--

INSERT INTO `workflow_stages` (`id`, `practice_area_id`, `stage_name`, `stage_code`, `stage_order`, `required_fields`, `auto_tasks`, `is_active`) VALUES
('ws-app-1', 'pa-app', 'Notice of Appeal & Transcripts', 'APP-1', 1, '[\"Timely Notice of Appeal Filed\", \"Court Reporter Transcripts Ordered\"]', '[{\"role\": \"paralegal\", \"title\": \"Review Trial Record on Appeal Index\", \"dueDays\": 20, \"priority\": \"High\"}]', 1),
('ws-app-2', 'pa-app', 'Appellate Briefing Schedule', 'APP-2', 2, '[\"Appellant Opening Brief Filed\", \"Appellee Response Brief Logged\"]', '[{\"role\": \"attorney\", \"title\": \"Draft Appellant Reply Brief and Request for Argument\", \"dueDays\": 30, \"priority\": \"Urgent\"}]', 1),
('ws-app-3', 'pa-app', 'Oral Argument & Opinion Entry', 'APP-3', 3, '[\"Oral Argument Concluded\", \"Appellate Court Opinion Issued\"]', '[{\"role\": \"attorney\", \"title\": \"Evaluate Petition for Rehearing or Remand Execution\", \"dueDays\": 14, \"priority\": \"High\"}]', 1),
('ws-bk-1', 'pa-bk', 'Intake & Means Testing Evaluation', 'BK-1', 1, '[\"Tax Returns Received\", \"6 Months Paystubs Received\"]', '[{\"role\": \"attorney\", \"title\": \"Perform Statutory Means Test Calculation (Form 122A/C)\", \"dueDays\": 7, \"priority\": \"High\"}]', 1),
('ws-bk-2', 'pa-bk', 'Schedules Assembly & Credit Counseling', 'BK-2', 2, '[\"Credit Counseling Certificate Received\", \"Creditor Matrix Verified\"]', '[{\"role\": \"paralegal\", \"title\": \"Schedule Client Petition Signing and Review Conference\", \"dueDays\": 5, \"priority\": \"High\"}]', 1),
('ws-bk-3', 'pa-bk', 'Court Petition Filing & 341 Prep', 'BK-3', 3, '[\"Petition Filed with Bankruptcy Court\", \"Official Case Number Issued\"]', '[{\"role\": \"paralegal\", \"title\": \"Deliver Section 521 Tax Documents to Assigned Trustee\", \"dueDays\": 7, \"priority\": \"Urgent\"}]', 1),
('ws-bk-4', 'pa-bk', 'Section 341 Meeting of Creditors', 'BK-4', 4, '[\"341 Examination Concluded\", \"Financial Management Course Certificate Logged\"]', '[{\"role\": \"paralegal\", \"title\": \"File Official Financial Management Certificate (Form 423)\", \"dueDays\": 14, \"priority\": \"High\"}]', 1),
('ws-bk-5', 'pa-bk', 'Discharge Order & Case Closure', 'BK-5', 5, '[\"Trustee Report of No Distribution Entered\", \"Discharge Order Entered\"]', '[{\"role\": \"attorney\", \"title\": \"Transmit Official Discharge Package to Debtor\", \"dueDays\": 5, \"priority\": \"Medium\"}]', 1),
('ws-civ-1', 'pa-civ', 'Pleadings & Motion Practice', 'CIV-1', 1, '[\"Summons & Complaint Served\", \"Answer or Responsive Motion Logged\"]', '[{\"role\": \"paralegal\", \"title\": \"Draft Rule 26 Initial Disclosures\", \"dueDays\": 14, \"priority\": \"High\"}]', 1),
('ws-civ-2', 'pa-civ', 'Written & Electronic Discovery', 'CIV-2', 2, '[\"Rule 26 Disclosures Exchanged\", \"ESI Protocol Order Entered\"]', '[{\"role\": \"paralegal\", \"title\": \"Produce Responsive Electronic Records & Bates Index\", \"dueDays\": 30, \"priority\": \"High\"}]', 1),
('ws-civ-3', 'pa-civ', 'Depositions & Expert Witness Phase', 'CIV-3', 3, '[\"Key Party Depositions Transcribed\", \"Expert Reports Exchanged\"]', '[{\"role\": \"attorney\", \"title\": \"Draft Motion for Summary Judgment or Settlement Brief\", \"dueDays\": 28, \"priority\": \"Urgent\"}]', 1),
('ws-civ-4', 'pa-civ', 'Trial Preparation & Judgment', 'CIV-4', 4, '[\"Pre-Trial Order Entered\", \"Jury Instructions Assembled\"]', '[{\"role\": \"attorney\", \"title\": \"Attend Trial / Conduct Final Settlement Execution\", \"dueDays\": 7, \"priority\": \"Urgent\"}]', 1),
('ws-crim-1', 'pa-crim', 'Arraignment & Discovery Review', 'CRIM-1', 1, '[\"Information/Indictment Received\", \"Bail Conditions Set\"]', '[{\"role\": \"attorney\", \"title\": \"Review Bodycam Footage & Police Incident Reports\", \"dueDays\": 10, \"priority\": \"High\"}]', 1),
('ws-crim-2', 'pa-crim', 'Suppression Motions & Plea Talks', 'CRIM-2', 2, '[\"Preliminary Hearing Waived or Conducted\", \"Plea Offer Evaluated\"]', '[{\"role\": \"attorney\", \"title\": \"File Fourth Amendment Motion to Suppress Evidence\", \"dueDays\": 14, \"priority\": \"Urgent\"}]', 1),
('ws-crim-3', 'pa-crim', 'Trial Setting or Sentencing Disposition', 'CRIM-3', 3, '[\"Plea Agreement Executed or Jury Verdict Entered\"]', '[{\"role\": \"attorney\", \"title\": \"Prepare Sentencing Memorandum and Mitigating Exhibits\", \"dueDays\": 14, \"priority\": \"High\"}]', 1),
('ws-evict-1', 'pa-evict', 'Statutory Notice & Summons', 'EVICT-1', 1, '[\"Three-Day Notice Served\", \"Unlawful Detainer Complaint Filed\"]', '[{\"role\": \"paralegal\", \"title\": \"Complete Expedited Process Service on Tenant\", \"dueDays\": 3, \"priority\": \"Urgent\"}]', 1),
('ws-evict-2', 'pa-evict', 'Occupancy Hearing & Writ', 'EVICT-2', 2, '[\"Immediate Occupancy Hearing Held\", \"Order of Restitution Issued\"]', '[{\"role\": \"paralegal\", \"title\": \"Deliver Writ of Restitution to County Sheriff\", \"dueDays\": 2, \"priority\": \"Urgent\"}]', 1),
('ws-evict-3', 'pa-evict', 'Damages Judgment & Collection', 'EVICT-3', 3, '[\"Physical Possession Restored\", \"Treble Damages Proof Filed\"]', '[{\"role\": \"attorney\", \"title\": \"Enter Final Civil Monetary Judgment against Tenant\", \"dueDays\": 14, \"priority\": \"Medium\"}]', 1),
('ws-fam-1', 'pa-fam', 'Petition & Temporary Orders', 'FAM-1', 1, '[\"Petition Served\", \"Financial Declarations Completed\"]', '[{\"role\": \"attorney\", \"title\": \"Request Temporary Custody and Support Hearing\", \"dueDays\": 14, \"priority\": \"Urgent\"}]', 1),
('ws-fam-2', 'pa-fam', 'Mandatory Mediation & Discovery', 'FAM-2', 2, '[\"Full Financial Disclosures Exchanged\", \"Mediation Session Conducted\"]', '[{\"role\": \"attorney\", \"title\": \"Draft Settlement Stipulation or Pre-Trial Readiness Statement\", \"dueDays\": 21, \"priority\": \"High\"}]', 1),
('ws-fam-3', 'pa-fam', 'Decree Entry & Enforcement', 'FAM-3', 3, '[\"Findings of Fact & Decree Signed by Judge\"]', '[{\"role\": \"paralegal\", \"title\": \"Submit Qualified Domestic Relations Order (QDRO)\", \"dueDays\": 15, \"priority\": \"High\"}]', 1),
('ws-imm-1', 'pa-imm', 'Eligibility & Questionnaire Audit', 'IMM-1', 1, '[\"Client Identity Documents Verified\", \"Prior Immigration History Cleared\"]', '[{\"role\": \"paralegal\", \"title\": \"Complete USCIS Petition Questionnaire Form Assembly\", \"dueDays\": 10, \"priority\": \"High\"}]', 1),
('ws-imm-2', 'pa-imm', 'Petition Assembly & Legal Review', 'IMM-2', 2, '[\"All Civil Documents Translated\", \"Filing Fee Checks Prepared\"]', '[{\"role\": \"attorney\", \"title\": \"Attorney Final Quality Verification and Form Signing\", \"dueDays\": 5, \"priority\": \"High\"}]', 1),
('ws-imm-3', 'pa-imm', 'USCIS Filing & I-797C Receipts', 'IMM-3', 3, '[\"Courier Delivery Confirmed\", \"Form I-797C Notice of Action Receipt Logged\"]', '[{\"role\": \"paralegal\", \"title\": \"Set 90-Day USCIS Processing Status Audit Alert\", \"dueDays\": 90, \"priority\": \"Medium\"}]', 1),
('ws-imm-4', 'pa-imm', 'Biometrics & RFE Processing', 'IMM-4', 4, '[\"ASC Biometrics Appointment Attended\"]', '[{\"role\": \"attorney\", \"title\": \"Prepare Response to Any Request for Evidence (RFE)\", \"dueDays\": 30, \"priority\": \"Urgent\"}]', 1),
('ws-imm-5', 'pa-imm', 'Field Office Interview & Adjudication', 'IMM-5', 5, '[\"USCIS Interview Notice Logged\", \"Mock Client Interview Executed\"]', '[{\"role\": \"attorney\", \"title\": \"Attend USCIS Field Office Interview with Client\", \"dueDays\": 10, \"priority\": \"Urgent\"}]', 1),
('ws-imm-6', 'pa-imm', 'Permanent Residency Approval & Closure', 'IMM-6', 6, '[\"Approval Notice Received\", \"Physical Card Delivery Verified\"]', '[{\"role\": \"attorney\", \"title\": \"Deliver Secure Immigration Vault Archival Package\", \"dueDays\": 5, \"priority\": \"Low\"}]', 1),
('ws-pi-1', 'pa-pi', 'Intake & Conflict Clearance', 'PI-1', 1, '[\"Conflict Cleared\", \"Signed Contingency Retainer Agreement\"]', '[{\"role\": \"paralegal\", \"title\": \"Request Police Accident Report\", \"dueDays\": 5, \"priority\": \"High\"}]', 1),
('ws-pi-2', 'pa-pi', 'Investigation & Medical Records', 'PI-2', 2, '[\"Police Report Received\", \"Medical Authorizations Dispatched\"]', '[{\"role\": \"attorney\", \"title\": \"Send Letter of Representation to Insurance Adjuster\", \"dueDays\": 3, \"priority\": \"High\"}]', 1),
('ws-pi-3', 'pa-pi', 'Medical Special Demand Package', 'PI-3', 3, '[\"All Medical Specials Received\", \"Demand Letter Drafted\"]', '[{\"role\": \"attorney\", \"title\": \"Review Insurance Policy Limits and Demand Response\", \"dueDays\": 30, \"priority\": \"Medium\"}]', 1),
('ws-pi-4', 'pa-pi', 'Pleadings & Formal Service', 'PI-4', 4, '[\"Complaint Filed in District Court\", \"Summons Issued\"]', '[{\"role\": \"paralegal\", \"title\": \"Execute Service of Process on Defendant Driver & Owner\", \"dueDays\": 20, \"priority\": \"Urgent\"}]', 1),
('ws-pi-5', 'pa-pi', 'Fact & Expert Discovery', 'PI-5', 5, '[\"Rule 26 Initial Disclosures Exchanged\", \"Written Interrogatories Served\"]', '[{\"role\": \"attorney\", \"title\": \"Depose Defendant Driver & Defense Medical Examiner\", \"dueDays\": 45, \"priority\": \"High\"}]', 1),
('ws-pi-6', 'pa-pi', 'Mediation & Pre-Trial Readiness', 'PI-6', 6, '[\"Mediation Statement Submitted\", \"Rule 26(a)(4) Pretrial Disclosures Ready\"]', '[{\"role\": \"attorney\", \"title\": \"Conduct Formal Pre-Trial Settlement Conference\", \"dueDays\": 14, \"priority\": \"Urgent\"}]', 1),
('ws-pi-7', 'pa-pi', 'Resolution, Liens & Disbursement', 'PI-7', 7, '[\"Settlement Agreement Executed\", \"Healthcare Subrogation Liens Negotiated\"]', '[{\"role\": \"billing\", \"title\": \"Draft Settlement Closing Statement and Disburse Trust Funds\", \"dueDays\": 7, \"priority\": \"High\"}]', 1),
('ws-prob-1', 'pa-prob', 'Petition for Probate & Heirs Notice', 'PROB-1', 1, '[\"Death Certificate Logged\", \"Original Will Deposited\"]', '[{\"role\": \"paralegal\", \"title\": \"Publish Notice to Creditors in Salt Lake Tribune\", \"dueDays\": 10, \"priority\": \"High\"}]', 1),
('ws-prob-2', 'pa-prob', 'Letters Testamentary & Inventory', 'PROB-2', 2, '[\"Letters Testamentary Issued\", \"Estate Bank Account Opened\"]', '[{\"role\": \"paralegal\", \"title\": \"Compile Formal Estate Inventory and Asset Appraisal\", \"dueDays\": 60, \"priority\": \"High\"}]', 1),
('ws-prob-3', 'pa-prob', 'Creditor Audit & Final Distribution', 'PROB-3', 3, '[\"Statutory 90-Day Creditor Notice Expired\", \"Estate Tax Clearance Received\"]', '[{\"role\": \"attorney\", \"title\": \"File Final Accounting & Petition for Complete Settlement\", \"dueDays\": 20, \"priority\": \"High\"}]', 1);

-- --------------------------------------------------------

--
-- Table structure for table `_prisma_migrations`
--

CREATE TABLE `_prisma_migrations` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `checksum` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `finished_at` datetime(3) DEFAULT NULL,
  `migration_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `logs` text COLLATE utf8mb4_unicode_ci,
  `rolled_back_at` datetime(3) DEFAULT NULL,
  `started_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `applied_steps_count` int UNSIGNED NOT NULL DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `_prisma_migrations`
--

INSERT INTO `_prisma_migrations` (`id`, `checksum`, `finished_at`, `migration_name`, `logs`, `rolled_back_at`, `started_at`, `applied_steps_count`) VALUES
('22f7c640-7b89-41ae-9332-23893d83a67f', '4b9ddc277a926d6b2e3a9e63ffe903a9a5f678b723933e8ee0b99a3876e05591', '2026-11-17 07:14:05.000', '20261116120000_add_specialty_practice_modules', NULL, NULL, '2026-11-17 07:14:05.000', 1),
('5e3c3502-8397-4d3d-bf99-7e593ebd9368', '681d1d95d3b13bc38f590e5044b56bd8eaeb04fc17dd4cbc7502fdcf9f2f2f2e', '2026-11-13 07:38:56.519', '20261113071216_init', NULL, NULL, '2026-11-13 07:38:54.871', 1),
('8d149480-6d72-47a8-8c41-2a31e1d92e8d', '9777d21d0d1d764327e010c59d4885000eb41b8105ea72a0cb6fd3a5d0f2c3d7', '2026-11-14 09:24:29.365', '20261114080000_add_pi_shared_data_model', NULL, NULL, '2026-11-14 09:24:26.457', 1),
('b7a874e9-71f3-4ebd-a617-d58fca51fa39', '6215aa5592f2b3bf43b905b798bf2f431d011577e2f6f042fe96ac845c21d464', '2026-11-17 07:13:55.000', '20261114164500_add_pi_core_data_model', NULL, NULL, '2026-11-17 07:13:55.000', 1),
('ba233eba-8e63-4b93-8fe4-698892a5b699', '9c51bee953822a14b716ef14c94591e786e1fce48cb94d5238e724a54ee91f5f', '2026-11-13 09:34:28.802', '20261113093500_add_intake_converted_matter', NULL, NULL, '2026-11-13 09:34:28.685', 1),
('ce70815f-98e0-465a-8a44-3cb5a66a0c0c', 'd726eca224c3dfecd64dfffba987df952345489da227da0c41cfd6a0caa7d6ba', '2026-11-14 06:57:56.761', '20261113124707_add_document_automation_foundation', NULL, NULL, '2026-11-14 06:57:55.057', 1),
('d2e0b985-2e7a-4937-8af8-a3c24d6866fd', '77552969a49cf0a0cb316c0406523bbca1235bb0fc5de5d3b57f30b420175094', '2026-11-17 07:14:01.000', '20261114164600_add_pi_triggers_and_constraints', NULL, NULL, '2026-11-17 07:14:01.000', 1);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `appeals_cases`
--
ALTER TABLE `appeals_cases`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `appeals_cases_matter_id_key` (`matter_id`);

--
-- Indexes for table `audit_logs`
--
ALTER TABLE `audit_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_audit_timestamp` (`timestamp`),
  ADD KEY `idx_audit_resource` (`resource_type`,`resource_id`),
  ADD KEY `audit_logs_user_id_fkey` (`user_id`);

--
-- Indexes for table `bankruptcy_cases`
--
ALTER TABLE `bankruptcy_cases`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `bankruptcy_cases_matter_id_key` (`matter_id`);

--
-- Indexes for table `bankruptcy_creditors`
--
ALTER TABLE `bankruptcy_creditors`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_creditors_bk_case` (`bankruptcy_case_id`);

--
-- Indexes for table `bankruptcy_schedules`
--
ALTER TABLE `bankruptcy_schedules`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_schedules_bk_case` (`bankruptcy_case_id`);

--
-- Indexes for table `calendar_events`
--
ALTER TABLE `calendar_events`
  ADD PRIMARY KEY (`id`),
  ADD KEY `calendar_events_matter_id_fkey` (`matter_id`),
  ADD KEY `calendar_events_created_by_user_id_fkey` (`created_by_user_id`);

--
-- Indexes for table `chart_of_accounts`
--
ALTER TABLE `chart_of_accounts`
  ADD PRIMARY KEY (`account_number`);

--
-- Indexes for table `clients`
--
ALTER TABLE `clients`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `clients_client_number_key` (`client_number`),
  ADD KEY `idx_clients_search` (`name`,`email`,`client_number`),
  ADD KEY `clients_assigned_attorney_id_fkey` (`assigned_attorney_id`);

--
-- Indexes for table `communications`
--
ALTER TABLE `communications`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_comms_client` (`client_id`),
  ADD KEY `idx_comms_matter` (`matter_id`);

--
-- Indexes for table `conflict_search_logs`
--
ALTER TABLE `conflict_search_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `conflict_search_logs_intake_id_fkey` (`intake_id`),
  ADD KEY `conflict_search_logs_searched_by_user_id_fkey` (`searched_by_user_id`);

--
-- Indexes for table `court_hearings`
--
ALTER TABLE `court_hearings`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_hearings_lit_case` (`litigation_case_id`);

--
-- Indexes for table `criminal_cases`
--
ALTER TABLE `criminal_cases`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `criminal_cases_matter_id_key` (`matter_id`);

--
-- Indexes for table `criminal_charges`
--
ALTER TABLE `criminal_charges`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_charges_criminal` (`criminal_case_id`);

--
-- Indexes for table `discovery_requests`
--
ALTER TABLE `discovery_requests`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_discovery_lit_case` (`litigation_case_id`);

--
-- Indexes for table `documents`
--
ALTER TABLE `documents`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `documents_document_code_key` (`document_code`),
  ADD KEY `documents_matter_id_fkey` (`matter_id`),
  ADD KEY `documents_client_id_fkey` (`client_id`);

--
-- Indexes for table `document_drafts`
--
ALTER TABLE `document_drafts`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `document_drafts_draft_code_key` (`draft_code`),
  ADD KEY `idx_doc_drafts_matter` (`matter_id`,`status`),
  ADD KEY `idx_doc_drafts_client` (`client_id`),
  ADD KEY `idx_doc_drafts_stale` (`is_stale`,`status`),
  ADD KEY `document_drafts_template_id_fkey` (`template_id`),
  ADD KEY `document_drafts_template_version_id_fkey` (`template_version_id`),
  ADD KEY `document_drafts_generated_by_user_id_fkey` (`generated_by_user_id`),
  ADD KEY `document_drafts_reviewed_by_user_id_fkey` (`reviewed_by_user_id`),
  ADD KEY `document_drafts_final_document_id_fkey` (`final_document_id`);

--
-- Indexes for table `document_field_mappings`
--
ALTER TABLE `document_field_mappings`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `document_field_mappings_template_version_id_placeholder_tag_key` (`template_version_id`,`placeholder_tag`),
  ADD KEY `idx_field_mappings_version` (`template_version_id`);

--
-- Indexes for table `document_templates`
--
ALTER TABLE `document_templates`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `document_templates_template_code_key` (`template_code`),
  ADD KEY `idx_doc_templates_search` (`practice_area_id`,`category`,`is_active`),
  ADD KEY `document_templates_created_by_user_id_fkey` (`created_by_user_id`);

--
-- Indexes for table `document_versions`
--
ALTER TABLE `document_versions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `document_versions_document_id_version_label_key` (`document_id`,`version_label`),
  ADD KEY `document_versions_uploaded_by_user_id_fkey` (`uploaded_by_user_id`);

--
-- Indexes for table `evictions_cases`
--
ALTER TABLE `evictions_cases`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `evictions_cases_matter_id_key` (`matter_id`);

--
-- Indexes for table `expenses`
--
ALTER TABLE `expenses`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `expenses_expense_code_key` (`expense_code`),
  ADD KEY `expenses_matter_id_fkey` (`matter_id`),
  ADD KEY `expenses_incurred_by_user_id_fkey` (`incurred_by_user_id`);

--
-- Indexes for table `family_law_cases`
--
ALTER TABLE `family_law_cases`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `family_law_cases_matter_id_key` (`matter_id`);

--
-- Indexes for table `family_law_orders`
--
ALTER TABLE `family_law_orders`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_orders_family_law` (`family_law_case_id`);

--
-- Indexes for table `general_ledger_entries`
--
ALTER TABLE `general_ledger_entries`
  ADD PRIMARY KEY (`id`),
  ADD KEY `general_ledger_entries_journal_id_fkey` (`journal_id`),
  ADD KEY `general_ledger_entries_account_number_fkey` (`account_number`),
  ADD KEY `general_ledger_entries_matter_id_fkey` (`matter_id`);

--
-- Indexes for table `general_ledger_journals`
--
ALTER TABLE `general_ledger_journals`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `general_ledger_journals_journal_number_key` (`journal_number`),
  ADD KEY `general_ledger_journals_created_by_user_id_fkey` (`created_by_user_id`);

--
-- Indexes for table `immigration_cases`
--
ALTER TABLE `immigration_cases`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `immigration_cases_matter_id_key` (`matter_id`);

--
-- Indexes for table `immigration_parties`
--
ALTER TABLE `immigration_parties`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_parties_imm_case` (`immigration_case_id`);

--
-- Indexes for table `intakes`
--
ALTER TABLE `intakes`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `intakes_intake_number_key` (`intake_number`),
  ADD KEY `intakes_practice_area_id_fkey` (`practice_area_id`),
  ADD KEY `intakes_reviewed_by_user_id_fkey` (`reviewed_by_user_id`),
  ADD KEY `intakes_converted_client_id_fkey` (`converted_client_id`),
  ADD KEY `intakes_converted_matter_id_fkey` (`converted_matter_id`);

--
-- Indexes for table `invoices`
--
ALTER TABLE `invoices`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `invoices_invoice_number_key` (`invoice_number`),
  ADD KEY `invoices_client_id_fkey` (`client_id`),
  ADD KEY `invoices_matter_id_fkey` (`matter_id`);

--
-- Indexes for table `invoice_line_items`
--
ALTER TABLE `invoice_line_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `invoice_line_items_invoice_id_fkey` (`invoice_id`),
  ADD KEY `invoice_line_items_time_entry_id_fkey` (`time_entry_id`),
  ADD KEY `invoice_line_items_expense_id_fkey` (`expense_id`);

--
-- Indexes for table `litigation_cases`
--
ALTER TABLE `litigation_cases`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `litigation_cases_matter_id_key` (`matter_id`);

--
-- Indexes for table `matters`
--
ALTER TABLE `matters`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `matters_matter_number_key` (`matter_number`),
  ADD KEY `idx_matters_client` (`client_id`),
  ADD KEY `idx_matters_attorney` (`responsible_attorney_id`),
  ADD KEY `matters_practice_area_id_fkey` (`practice_area_id`),
  ADD KEY `matters_current_stage_id_fkey` (`current_stage_id`);

--
-- Indexes for table `matter_staff_assignments`
--
ALTER TABLE `matter_staff_assignments`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `matter_staff_assignments_matter_id_user_id_key` (`matter_id`,`user_id`),
  ADD KEY `matter_staff_assignments_user_id_fkey` (`user_id`);

--
-- Indexes for table `matter_stage_histories`
--
ALTER TABLE `matter_stage_histories`
  ADD PRIMARY KEY (`id`),
  ADD KEY `matter_stage_histories_matter_id_fkey` (`matter_id`),
  ADD KEY `matter_stage_histories_to_stage_id_fkey` (`to_stage_id`),
  ADD KEY `matter_stage_histories_transitioned_by_user_id_fkey` (`transitioned_by_user_id`);

--
-- Indexes for table `payment_records`
--
ALTER TABLE `payment_records`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `payment_records_payment_reference_key` (`payment_reference`),
  ADD KEY `payment_records_invoice_id_fkey` (`invoice_id`),
  ADD KEY `payment_records_client_id_fkey` (`client_id`),
  ADD KEY `payment_records_recorded_by_user_id_fkey` (`recorded_by_user_id`);

--
-- Indexes for table `pi_damages_records`
--
ALTER TABLE `pi_damages_records`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_damages_matter` (`matter_id`);

--
-- Indexes for table `pi_demand_packages`
--
ALTER TABLE `pi_demand_packages`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_demand_matter` (`matter_id`),
  ADD KEY `idx_demand_policy` (`insurance_policy_id`),
  ADD KEY `pi_demand_packages_draft_document_id_fkey` (`draft_document_id`),
  ADD KEY `pi_demand_packages_approved_by_attorney_id_fkey` (`approved_by_attorney_id`);

--
-- Indexes for table `pi_diagnostic_studies`
--
ALTER TABLE `pi_diagnostic_studies`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_diagnostics_matter` (`matter_id`),
  ADD KEY `idx_diagnostics_damage` (`damages_record_id`),
  ADD KEY `pi_diagnostic_studies_imaging_report_document_id_fkey` (`imaging_report_document_id`);

--
-- Indexes for table `pi_incidents`
--
ALTER TABLE `pi_incidents`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_incidents_matter` (`matter_id`);

--
-- Indexes for table `pi_incident_parties`
--
ALTER TABLE `pi_incident_parties`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_parties_incident` (`incident_id`);

--
-- Indexes for table `pi_insurance_policies`
--
ALTER TABLE `pi_insurance_policies`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_policies_matter` (`matter_id`),
  ADD KEY `pi_insurance_policies_incident_id_fkey` (`incident_id`);

--
-- Indexes for table `pi_liens`
--
ALTER TABLE `pi_liens`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_liens_matter` (`matter_id`),
  ADD KEY `idx_liens_provider` (`provider_id`),
  ADD KEY `pi_liens_final_payoff_letter_document_id_fkey` (`final_payoff_letter_document_id`);

--
-- Indexes for table `pi_lien_negotiations`
--
ALTER TABLE `pi_lien_negotiations`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_negotiations_lien` (`lien_id`),
  ADD KEY `pi_lien_negotiations_conducted_by_user_id_fkey` (`conducted_by_user_id`);

--
-- Indexes for table `pi_medical_billing_summaries`
--
ALTER TABLE `pi_medical_billing_summaries`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `pi_medical_billing_summaries_provider_id_account_number_key` (`provider_id`,`account_number`),
  ADD KEY `idx_med_billing_matter` (`matter_id`),
  ADD KEY `idx_med_billing_provider` (`provider_id`),
  ADD KEY `pi_medical_billing_summaries_provider_id_matter_id_fkey` (`provider_id`,`matter_id`),
  ADD KEY `pi_medical_billing_summaries_billing_ledger_document_id_fkey` (`billing_ledger_document_id`);

--
-- Indexes for table `pi_medical_payment_records`
--
ALTER TABLE `pi_medical_payment_records`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `pi_medical_payment_records_reversal_of_record_id_key` (`reversal_of_record_id`),
  ADD KEY `idx_payments_summary` (`billing_summary_id`),
  ADD KEY `pi_medical_payment_records_eob_document_id_fkey` (`eob_document_id`),
  ADD KEY `pi_medical_payment_records_created_by_user_id_fkey` (`created_by_user_id`);

--
-- Indexes for table `pi_medical_providers`
--
ALTER TABLE `pi_medical_providers`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `pi_medical_providers_id_matter_id_key` (`id`,`matter_id`),
  ADD KEY `idx_providers_matter` (`matter_id`);

--
-- Indexes for table `pi_medical_record_requests`
--
ALTER TABLE `pi_medical_record_requests`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `pi_medical_record_requests_request_code_key` (`request_code`),
  ADD KEY `idx_record_requests_matter` (`matter_id`),
  ADD KEY `idx_record_requests_provider` (`provider_id`);

--
-- Indexes for table `pi_settlement_disbursements`
--
ALTER TABLE `pi_settlement_disbursements`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_settlements_matter` (`matter_id`);

--
-- Indexes for table `pi_settlement_disbursement_versions`
--
ALTER TABLE `pi_settlement_disbursement_versions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `pi_settlement_disbursement_versions_settlement_disbursement__key` (`settlement_disbursement_id`,`version_number`),
  ADD KEY `pi_settlement_disbursement_versions_signed_closing_statemen_fkey` (`signed_closing_statement_doc_id`),
  ADD KEY `pi_settlement_disbursement_versions_approved_by_attorney_id_fkey` (`approved_by_attorney_id`),
  ADD KEY `pi_settlement_disbursement_versions_created_by_user_id_fkey` (`created_by_user_id`);

--
-- Indexes for table `pi_settlement_executions`
--
ALTER TABLE `pi_settlement_executions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `pi_settlement_executions_settlement_version_id_key` (`settlement_version_id`),
  ADD UNIQUE KEY `pi_settlement_executions_idempotency_key_key` (`idempotency_key`),
  ADD UNIQUE KEY `pi_settlement_executions_id_trust_sub_ledger_id_key` (`id`,`trust_sub_ledger_id`),
  ADD KEY `pi_settlement_executions_trust_sub_ledger_id_fkey` (`trust_sub_ledger_id`),
  ADD KEY `pi_settlement_executions_executed_by_user_id_fkey` (`executed_by_user_id`);

--
-- Indexes for table `pi_settlement_execution_lines`
--
ALTER TABLE `pi_settlement_execution_lines`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `pi_settlement_execution_lines_trust_transaction_id_key` (`trust_transaction_id`),
  ADD UNIQUE KEY `pi_settlement_execution_lines_settlement_execution_id_line_i_key` (`settlement_execution_id`,`line_identifier`),
  ADD UNIQUE KEY `pi_settlement_execution_lines_trust_transaction_id_trust_sub_key` (`trust_transaction_id`,`trust_sub_ledger_id`),
  ADD KEY `idx_execution_lines_subledger` (`trust_sub_ledger_id`),
  ADD KEY `idx_execution_lines_lien` (`lien_id`),
  ADD KEY `pi_settlement_execution_lines_settlement_execution_id_trust_fkey` (`settlement_execution_id`,`trust_sub_ledger_id`);

--
-- Indexes for table `pi_vendors`
--
ALTER TABLE `pi_vendors`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `pi_vendor_assignments`
--
ALTER TABLE `pi_vendor_assignments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_vendor_assign_matter` (`matter_id`),
  ADD KEY `idx_vendor_assign_vendor` (`vendor_id`),
  ADD KEY `pi_vendor_assignments_assigned_staff_id_fkey` (`assigned_staff_id`),
  ADD KEY `pi_vendor_assignments_expense_id_fkey` (`expense_id`),
  ADD KEY `pi_vendor_assignments_report_document_id_fkey` (`report_document_id`);

--
-- Indexes for table `pi_wage_loss_records`
--
ALTER TABLE `pi_wage_loss_records`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_wageloss_matter` (`matter_id`),
  ADD KEY `pi_wage_loss_records_verification_document_id_fkey` (`verification_document_id`);

--
-- Indexes for table `pleadings_records`
--
ALTER TABLE `pleadings_records`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_pleadings_lit_case` (`litigation_case_id`);

--
-- Indexes for table `practice_areas`
--
ALTER TABLE `practice_areas`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `practice_areas_code_key` (`code`);

--
-- Indexes for table `probate_assets`
--
ALTER TABLE `probate_assets`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_assets_probate` (`probate_case_id`);

--
-- Indexes for table `probate_beneficiaries`
--
ALTER TABLE `probate_beneficiaries`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_beneficiaries_probate` (`probate_case_id`);

--
-- Indexes for table `probate_cases`
--
ALTER TABLE `probate_cases`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `probate_cases_matter_id_key` (`matter_id`);

--
-- Indexes for table `roles`
--
ALTER TABLE `roles`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `role_permissions`
--
ALTER TABLE `role_permissions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `role_permissions_role_id_permission_key_key` (`role_id`,`permission_key`);

--
-- Indexes for table `suggested_billing_captures`
--
ALTER TABLE `suggested_billing_captures`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `suggested_billing_captures_source_identifier_key` (`source_identifier`),
  ADD KEY `suggested_billing_captures_matter_id_fkey` (`matter_id`),
  ADD KEY `suggested_billing_captures_converted_time_entry_id_fkey` (`converted_time_entry_id`);

--
-- Indexes for table `tasks`
--
ALTER TABLE `tasks`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `tasks_task_code_key` (`task_code`),
  ADD KEY `idx_tasks_assigned_due` (`assigned_to_user_id`,`due_date`,`status`),
  ADD KEY `tasks_matter_id_fkey` (`matter_id`),
  ADD KEY `tasks_created_by_user_id_fkey` (`created_by_user_id`);

--
-- Indexes for table `template_versions`
--
ALTER TABLE `template_versions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `template_versions_template_id_version_number_key` (`template_id`,`version_number`),
  ADD KEY `template_versions_created_by_user_id_fkey` (`created_by_user_id`);

--
-- Indexes for table `three_way_reconciliations`
--
ALTER TABLE `three_way_reconciliations`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `three_way_reconciliations_reconciliation_month_key` (`reconciliation_month`),
  ADD KEY `three_way_reconciliations_audited_by_user_id_fkey` (`audited_by_user_id`);

--
-- Indexes for table `time_entries`
--
ALTER TABLE `time_entries`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `time_entries_entry_code_key` (`entry_code`),
  ADD KEY `idx_time_matter_status` (`matter_id`,`status`),
  ADD KEY `idx_time_user_date` (`user_id`,`date`),
  ADD KEY `time_entries_approved_by_user_id_fkey` (`approved_by_user_id`);

--
-- Indexes for table `trial_notebook_items`
--
ALTER TABLE `trial_notebook_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_trial_nb_lit_case` (`litigation_case_id`);

--
-- Indexes for table `trust_sub_ledgers`
--
ALTER TABLE `trust_sub_ledgers`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `trust_sub_ledgers_ledger_code_key` (`ledger_code`),
  ADD UNIQUE KEY `trust_sub_ledgers_matter_id_key` (`matter_id`),
  ADD KEY `trust_sub_ledgers_client_id_fkey` (`client_id`);

--
-- Indexes for table `trust_transactions`
--
ALTER TABLE `trust_transactions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `trust_transactions_id_trust_sub_ledger_id_key` (`id`,`trust_sub_ledger_id`),
  ADD KEY `trust_transactions_trust_sub_ledger_id_fkey` (`trust_sub_ledger_id`),
  ADD KEY `trust_transactions_authorized_by_user_id_fkey` (`authorized_by_user_id`);

--
-- Indexes for table `unmatched_communications`
--
ALTER TABLE `unmatched_communications`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `uscis_receipts`
--
ALTER TABLE `uscis_receipts`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uscis_receipts_receipt_number_key` (`receipt_number`),
  ADD KEY `idx_receipts_imm_case` (`immigration_case_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `users_user_code_key` (`user_code`),
  ADD UNIQUE KEY `users_email_key` (`email`),
  ADD KEY `users_role_fkey` (`role`);

--
-- Indexes for table `workflow_stages`
--
ALTER TABLE `workflow_stages`
  ADD PRIMARY KEY (`id`),
  ADD KEY `workflow_stages_practice_area_id_fkey` (`practice_area_id`);

--
-- Indexes for table `_prisma_migrations`
--
ALTER TABLE `_prisma_migrations`
  ADD PRIMARY KEY (`id`);

--
-- Constraints for dumped tables
--

--
-- Constraints for table `appeals_cases`
--
ALTER TABLE `appeals_cases`
  ADD CONSTRAINT `appeals_cases_matter_id_fkey` FOREIGN KEY (`matter_id`) REFERENCES `matters` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `audit_logs`
--
ALTER TABLE `audit_logs`
  ADD CONSTRAINT `audit_logs_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `bankruptcy_cases`
--
ALTER TABLE `bankruptcy_cases`
  ADD CONSTRAINT `bankruptcy_cases_matter_id_fkey` FOREIGN KEY (`matter_id`) REFERENCES `matters` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `bankruptcy_creditors`
--
ALTER TABLE `bankruptcy_creditors`
  ADD CONSTRAINT `bankruptcy_creditors_bankruptcy_case_id_fkey` FOREIGN KEY (`bankruptcy_case_id`) REFERENCES `bankruptcy_cases` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `bankruptcy_schedules`
--
ALTER TABLE `bankruptcy_schedules`
  ADD CONSTRAINT `bankruptcy_schedules_bankruptcy_case_id_fkey` FOREIGN KEY (`bankruptcy_case_id`) REFERENCES `bankruptcy_cases` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `calendar_events`
--
ALTER TABLE `calendar_events`
  ADD CONSTRAINT `calendar_events_created_by_user_id_fkey` FOREIGN KEY (`created_by_user_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT `calendar_events_matter_id_fkey` FOREIGN KEY (`matter_id`) REFERENCES `matters` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `clients`
--
ALTER TABLE `clients`
  ADD CONSTRAINT `clients_assigned_attorney_id_fkey` FOREIGN KEY (`assigned_attorney_id`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `communications`
--
ALTER TABLE `communications`
  ADD CONSTRAINT `communications_client_id_fkey` FOREIGN KEY (`client_id`) REFERENCES `clients` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `communications_matter_id_fkey` FOREIGN KEY (`matter_id`) REFERENCES `matters` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `conflict_search_logs`
--
ALTER TABLE `conflict_search_logs`
  ADD CONSTRAINT `conflict_search_logs_intake_id_fkey` FOREIGN KEY (`intake_id`) REFERENCES `intakes` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `conflict_search_logs_searched_by_user_id_fkey` FOREIGN KEY (`searched_by_user_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

--
-- Constraints for table `court_hearings`
--
ALTER TABLE `court_hearings`
  ADD CONSTRAINT `court_hearings_litigation_case_id_fkey` FOREIGN KEY (`litigation_case_id`) REFERENCES `litigation_cases` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `criminal_cases`
--
ALTER TABLE `criminal_cases`
  ADD CONSTRAINT `criminal_cases_matter_id_fkey` FOREIGN KEY (`matter_id`) REFERENCES `matters` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `criminal_charges`
--
ALTER TABLE `criminal_charges`
  ADD CONSTRAINT `criminal_charges_criminal_case_id_fkey` FOREIGN KEY (`criminal_case_id`) REFERENCES `criminal_cases` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `discovery_requests`
--
ALTER TABLE `discovery_requests`
  ADD CONSTRAINT `discovery_requests_litigation_case_id_fkey` FOREIGN KEY (`litigation_case_id`) REFERENCES `litigation_cases` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `documents`
--
ALTER TABLE `documents`
  ADD CONSTRAINT `documents_client_id_fkey` FOREIGN KEY (`client_id`) REFERENCES `clients` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT `documents_matter_id_fkey` FOREIGN KEY (`matter_id`) REFERENCES `matters` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `document_drafts`
--
ALTER TABLE `document_drafts`
  ADD CONSTRAINT `document_drafts_client_id_fkey` FOREIGN KEY (`client_id`) REFERENCES `clients` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT `document_drafts_final_document_id_fkey` FOREIGN KEY (`final_document_id`) REFERENCES `documents` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `document_drafts_generated_by_user_id_fkey` FOREIGN KEY (`generated_by_user_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT `document_drafts_matter_id_fkey` FOREIGN KEY (`matter_id`) REFERENCES `matters` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `document_drafts_reviewed_by_user_id_fkey` FOREIGN KEY (`reviewed_by_user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `document_drafts_template_id_fkey` FOREIGN KEY (`template_id`) REFERENCES `document_templates` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT `document_drafts_template_version_id_fkey` FOREIGN KEY (`template_version_id`) REFERENCES `template_versions` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

--
-- Constraints for table `document_field_mappings`
--
ALTER TABLE `document_field_mappings`
  ADD CONSTRAINT `document_field_mappings_template_version_id_fkey` FOREIGN KEY (`template_version_id`) REFERENCES `template_versions` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `document_templates`
--
ALTER TABLE `document_templates`
  ADD CONSTRAINT `document_templates_created_by_user_id_fkey` FOREIGN KEY (`created_by_user_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT `document_templates_practice_area_id_fkey` FOREIGN KEY (`practice_area_id`) REFERENCES `practice_areas` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

--
-- Constraints for table `document_versions`
--
ALTER TABLE `document_versions`
  ADD CONSTRAINT `document_versions_document_id_fkey` FOREIGN KEY (`document_id`) REFERENCES `documents` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `document_versions_uploaded_by_user_id_fkey` FOREIGN KEY (`uploaded_by_user_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

--
-- Constraints for table `evictions_cases`
--
ALTER TABLE `evictions_cases`
  ADD CONSTRAINT `evictions_cases_matter_id_fkey` FOREIGN KEY (`matter_id`) REFERENCES `matters` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `expenses`
--
ALTER TABLE `expenses`
  ADD CONSTRAINT `expenses_incurred_by_user_id_fkey` FOREIGN KEY (`incurred_by_user_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT `expenses_matter_id_fkey` FOREIGN KEY (`matter_id`) REFERENCES `matters` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

--
-- Constraints for table `family_law_cases`
--
ALTER TABLE `family_law_cases`
  ADD CONSTRAINT `family_law_cases_matter_id_fkey` FOREIGN KEY (`matter_id`) REFERENCES `matters` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `family_law_orders`
--
ALTER TABLE `family_law_orders`
  ADD CONSTRAINT `family_law_orders_family_law_case_id_fkey` FOREIGN KEY (`family_law_case_id`) REFERENCES `family_law_cases` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `general_ledger_entries`
--
ALTER TABLE `general_ledger_entries`
  ADD CONSTRAINT `general_ledger_entries_account_number_fkey` FOREIGN KEY (`account_number`) REFERENCES `chart_of_accounts` (`account_number`) ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT `general_ledger_entries_journal_id_fkey` FOREIGN KEY (`journal_id`) REFERENCES `general_ledger_journals` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `general_ledger_entries_matter_id_fkey` FOREIGN KEY (`matter_id`) REFERENCES `matters` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `general_ledger_journals`
--
ALTER TABLE `general_ledger_journals`
  ADD CONSTRAINT `general_ledger_journals_created_by_user_id_fkey` FOREIGN KEY (`created_by_user_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

--
-- Constraints for table `immigration_cases`
--
ALTER TABLE `immigration_cases`
  ADD CONSTRAINT `immigration_cases_matter_id_fkey` FOREIGN KEY (`matter_id`) REFERENCES `matters` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `immigration_parties`
--
ALTER TABLE `immigration_parties`
  ADD CONSTRAINT `immigration_parties_immigration_case_id_fkey` FOREIGN KEY (`immigration_case_id`) REFERENCES `immigration_cases` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `intakes`
--
ALTER TABLE `intakes`
  ADD CONSTRAINT `intakes_converted_client_id_fkey` FOREIGN KEY (`converted_client_id`) REFERENCES `clients` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `intakes_converted_matter_id_fkey` FOREIGN KEY (`converted_matter_id`) REFERENCES `matters` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `intakes_practice_area_id_fkey` FOREIGN KEY (`practice_area_id`) REFERENCES `practice_areas` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `intakes_reviewed_by_user_id_fkey` FOREIGN KEY (`reviewed_by_user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `invoices`
--
ALTER TABLE `invoices`
  ADD CONSTRAINT `invoices_client_id_fkey` FOREIGN KEY (`client_id`) REFERENCES `clients` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT `invoices_matter_id_fkey` FOREIGN KEY (`matter_id`) REFERENCES `matters` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

--
-- Constraints for table `invoice_line_items`
--
ALTER TABLE `invoice_line_items`
  ADD CONSTRAINT `invoice_line_items_expense_id_fkey` FOREIGN KEY (`expense_id`) REFERENCES `expenses` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `invoice_line_items_invoice_id_fkey` FOREIGN KEY (`invoice_id`) REFERENCES `invoices` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `invoice_line_items_time_entry_id_fkey` FOREIGN KEY (`time_entry_id`) REFERENCES `time_entries` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `litigation_cases`
--
ALTER TABLE `litigation_cases`
  ADD CONSTRAINT `litigation_cases_matter_id_fkey` FOREIGN KEY (`matter_id`) REFERENCES `matters` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `matters`
--
ALTER TABLE `matters`
  ADD CONSTRAINT `matters_client_id_fkey` FOREIGN KEY (`client_id`) REFERENCES `clients` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT `matters_current_stage_id_fkey` FOREIGN KEY (`current_stage_id`) REFERENCES `workflow_stages` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `matters_practice_area_id_fkey` FOREIGN KEY (`practice_area_id`) REFERENCES `practice_areas` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT `matters_responsible_attorney_id_fkey` FOREIGN KEY (`responsible_attorney_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

--
-- Constraints for table `matter_staff_assignments`
--
ALTER TABLE `matter_staff_assignments`
  ADD CONSTRAINT `matter_staff_assignments_matter_id_fkey` FOREIGN KEY (`matter_id`) REFERENCES `matters` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `matter_staff_assignments_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `matter_stage_histories`
--
ALTER TABLE `matter_stage_histories`
  ADD CONSTRAINT `matter_stage_histories_matter_id_fkey` FOREIGN KEY (`matter_id`) REFERENCES `matters` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `matter_stage_histories_to_stage_id_fkey` FOREIGN KEY (`to_stage_id`) REFERENCES `workflow_stages` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT `matter_stage_histories_transitioned_by_user_id_fkey` FOREIGN KEY (`transitioned_by_user_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

--
-- Constraints for table `payment_records`
--
ALTER TABLE `payment_records`
  ADD CONSTRAINT `payment_records_client_id_fkey` FOREIGN KEY (`client_id`) REFERENCES `clients` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT `payment_records_invoice_id_fkey` FOREIGN KEY (`invoice_id`) REFERENCES `invoices` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT `payment_records_recorded_by_user_id_fkey` FOREIGN KEY (`recorded_by_user_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

--
-- Constraints for table `pi_damages_records`
--
ALTER TABLE `pi_damages_records`
  ADD CONSTRAINT `pi_damages_records_matter_id_fkey` FOREIGN KEY (`matter_id`) REFERENCES `matters` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

--
-- Constraints for table `pi_demand_packages`
--
ALTER TABLE `pi_demand_packages`
  ADD CONSTRAINT `pi_demand_packages_approved_by_attorney_id_fkey` FOREIGN KEY (`approved_by_attorney_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT `pi_demand_packages_draft_document_id_fkey` FOREIGN KEY (`draft_document_id`) REFERENCES `documents` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT `pi_demand_packages_insurance_policy_id_fkey` FOREIGN KEY (`insurance_policy_id`) REFERENCES `pi_insurance_policies` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `pi_demand_packages_matter_id_fkey` FOREIGN KEY (`matter_id`) REFERENCES `matters` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

--
-- Constraints for table `pi_diagnostic_studies`
--
ALTER TABLE `pi_diagnostic_studies`
  ADD CONSTRAINT `pi_diagnostic_studies_damages_record_id_fkey` FOREIGN KEY (`damages_record_id`) REFERENCES `pi_damages_records` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `pi_diagnostic_studies_imaging_report_document_id_fkey` FOREIGN KEY (`imaging_report_document_id`) REFERENCES `documents` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT `pi_diagnostic_studies_matter_id_fkey` FOREIGN KEY (`matter_id`) REFERENCES `matters` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

--
-- Constraints for table `pi_incidents`
--
ALTER TABLE `pi_incidents`
  ADD CONSTRAINT `pi_incidents_matter_id_fkey` FOREIGN KEY (`matter_id`) REFERENCES `matters` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `pi_incident_parties`
--
ALTER TABLE `pi_incident_parties`
  ADD CONSTRAINT `pi_incident_parties_incident_id_fkey` FOREIGN KEY (`incident_id`) REFERENCES `pi_incidents` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `pi_insurance_policies`
--
ALTER TABLE `pi_insurance_policies`
  ADD CONSTRAINT `pi_insurance_policies_incident_id_fkey` FOREIGN KEY (`incident_id`) REFERENCES `pi_incidents` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `pi_insurance_policies_matter_id_fkey` FOREIGN KEY (`matter_id`) REFERENCES `matters` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `pi_liens`
--
ALTER TABLE `pi_liens`
  ADD CONSTRAINT `pi_liens_final_payoff_letter_document_id_fkey` FOREIGN KEY (`final_payoff_letter_document_id`) REFERENCES `documents` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT `pi_liens_matter_id_fkey` FOREIGN KEY (`matter_id`) REFERENCES `matters` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT `pi_liens_provider_id_fkey` FOREIGN KEY (`provider_id`) REFERENCES `pi_medical_providers` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `pi_lien_negotiations`
--
ALTER TABLE `pi_lien_negotiations`
  ADD CONSTRAINT `pi_lien_negotiations_conducted_by_user_id_fkey` FOREIGN KEY (`conducted_by_user_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT `pi_lien_negotiations_lien_id_fkey` FOREIGN KEY (`lien_id`) REFERENCES `pi_liens` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

--
-- Constraints for table `pi_medical_billing_summaries`
--
ALTER TABLE `pi_medical_billing_summaries`
  ADD CONSTRAINT `pi_medical_billing_summaries_billing_ledger_document_id_fkey` FOREIGN KEY (`billing_ledger_document_id`) REFERENCES `documents` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT `pi_medical_billing_summaries_matter_id_fkey` FOREIGN KEY (`matter_id`) REFERENCES `matters` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT `pi_medical_billing_summaries_provider_id_matter_id_fkey` FOREIGN KEY (`provider_id`,`matter_id`) REFERENCES `pi_medical_providers` (`id`, `matter_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

--
-- Constraints for table `pi_medical_payment_records`
--
ALTER TABLE `pi_medical_payment_records`
  ADD CONSTRAINT `pi_medical_payment_records_billing_summary_id_fkey` FOREIGN KEY (`billing_summary_id`) REFERENCES `pi_medical_billing_summaries` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT `pi_medical_payment_records_created_by_user_id_fkey` FOREIGN KEY (`created_by_user_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT `pi_medical_payment_records_eob_document_id_fkey` FOREIGN KEY (`eob_document_id`) REFERENCES `documents` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT `pi_medical_payment_records_reversal_of_record_id_fkey` FOREIGN KEY (`reversal_of_record_id`) REFERENCES `pi_medical_payment_records` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

--
-- Constraints for table `pi_medical_providers`
--
ALTER TABLE `pi_medical_providers`
  ADD CONSTRAINT `pi_medical_providers_matter_id_fkey` FOREIGN KEY (`matter_id`) REFERENCES `matters` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `pi_medical_record_requests`
--
ALTER TABLE `pi_medical_record_requests`
  ADD CONSTRAINT `pi_medical_record_requests_matter_id_fkey` FOREIGN KEY (`matter_id`) REFERENCES `matters` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `pi_medical_record_requests_provider_id_fkey` FOREIGN KEY (`provider_id`) REFERENCES `pi_medical_providers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `pi_settlement_disbursements`
--
ALTER TABLE `pi_settlement_disbursements`
  ADD CONSTRAINT `pi_settlement_disbursements_matter_id_fkey` FOREIGN KEY (`matter_id`) REFERENCES `matters` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

--
-- Constraints for table `pi_settlement_disbursement_versions`
--
ALTER TABLE `pi_settlement_disbursement_versions`
  ADD CONSTRAINT `pi_settlement_disbursement_versions_approved_by_attorney_id_fkey` FOREIGN KEY (`approved_by_attorney_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT `pi_settlement_disbursement_versions_created_by_user_id_fkey` FOREIGN KEY (`created_by_user_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT `pi_settlement_disbursement_versions_settlement_disbursement_fkey` FOREIGN KEY (`settlement_disbursement_id`) REFERENCES `pi_settlement_disbursements` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT `pi_settlement_disbursement_versions_signed_closing_statemen_fkey` FOREIGN KEY (`signed_closing_statement_doc_id`) REFERENCES `documents` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

--
-- Constraints for table `pi_settlement_executions`
--
ALTER TABLE `pi_settlement_executions`
  ADD CONSTRAINT `pi_settlement_executions_executed_by_user_id_fkey` FOREIGN KEY (`executed_by_user_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT `pi_settlement_executions_settlement_version_id_fkey` FOREIGN KEY (`settlement_version_id`) REFERENCES `pi_settlement_disbursement_versions` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT `pi_settlement_executions_trust_sub_ledger_id_fkey` FOREIGN KEY (`trust_sub_ledger_id`) REFERENCES `trust_sub_ledgers` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

--
-- Constraints for table `pi_settlement_execution_lines`
--
ALTER TABLE `pi_settlement_execution_lines`
  ADD CONSTRAINT `pi_settlement_execution_lines_lien_id_fkey` FOREIGN KEY (`lien_id`) REFERENCES `pi_liens` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT `pi_settlement_execution_lines_settlement_execution_id_trust_fkey` FOREIGN KEY (`settlement_execution_id`,`trust_sub_ledger_id`) REFERENCES `pi_settlement_executions` (`id`, `trust_sub_ledger_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT `pi_settlement_execution_lines_trust_transaction_id_trust_su_fkey` FOREIGN KEY (`trust_transaction_id`,`trust_sub_ledger_id`) REFERENCES `trust_transactions` (`id`, `trust_sub_ledger_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

--
-- Constraints for table `pi_vendor_assignments`
--
ALTER TABLE `pi_vendor_assignments`
  ADD CONSTRAINT `pi_vendor_assignments_assigned_staff_id_fkey` FOREIGN KEY (`assigned_staff_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT `pi_vendor_assignments_expense_id_fkey` FOREIGN KEY (`expense_id`) REFERENCES `expenses` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `pi_vendor_assignments_matter_id_fkey` FOREIGN KEY (`matter_id`) REFERENCES `matters` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT `pi_vendor_assignments_report_document_id_fkey` FOREIGN KEY (`report_document_id`) REFERENCES `documents` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT `pi_vendor_assignments_vendor_id_fkey` FOREIGN KEY (`vendor_id`) REFERENCES `pi_vendors` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

--
-- Constraints for table `pi_wage_loss_records`
--
ALTER TABLE `pi_wage_loss_records`
  ADD CONSTRAINT `pi_wage_loss_records_matter_id_fkey` FOREIGN KEY (`matter_id`) REFERENCES `matters` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT `pi_wage_loss_records_verification_document_id_fkey` FOREIGN KEY (`verification_document_id`) REFERENCES `documents` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

--
-- Constraints for table `pleadings_records`
--
ALTER TABLE `pleadings_records`
  ADD CONSTRAINT `pleadings_records_litigation_case_id_fkey` FOREIGN KEY (`litigation_case_id`) REFERENCES `litigation_cases` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `probate_assets`
--
ALTER TABLE `probate_assets`
  ADD CONSTRAINT `probate_assets_probate_case_id_fkey` FOREIGN KEY (`probate_case_id`) REFERENCES `probate_cases` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `probate_beneficiaries`
--
ALTER TABLE `probate_beneficiaries`
  ADD CONSTRAINT `probate_beneficiaries_probate_case_id_fkey` FOREIGN KEY (`probate_case_id`) REFERENCES `probate_cases` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `probate_cases`
--
ALTER TABLE `probate_cases`
  ADD CONSTRAINT `probate_cases_matter_id_fkey` FOREIGN KEY (`matter_id`) REFERENCES `matters` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `role_permissions`
--
ALTER TABLE `role_permissions`
  ADD CONSTRAINT `role_permissions_role_id_fkey` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `suggested_billing_captures`
--
ALTER TABLE `suggested_billing_captures`
  ADD CONSTRAINT `suggested_billing_captures_converted_time_entry_id_fkey` FOREIGN KEY (`converted_time_entry_id`) REFERENCES `time_entries` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `suggested_billing_captures_matter_id_fkey` FOREIGN KEY (`matter_id`) REFERENCES `matters` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `tasks`
--
ALTER TABLE `tasks`
  ADD CONSTRAINT `tasks_assigned_to_user_id_fkey` FOREIGN KEY (`assigned_to_user_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT `tasks_created_by_user_id_fkey` FOREIGN KEY (`created_by_user_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT `tasks_matter_id_fkey` FOREIGN KEY (`matter_id`) REFERENCES `matters` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `template_versions`
--
ALTER TABLE `template_versions`
  ADD CONSTRAINT `template_versions_created_by_user_id_fkey` FOREIGN KEY (`created_by_user_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT `template_versions_template_id_fkey` FOREIGN KEY (`template_id`) REFERENCES `document_templates` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `three_way_reconciliations`
--
ALTER TABLE `three_way_reconciliations`
  ADD CONSTRAINT `three_way_reconciliations_audited_by_user_id_fkey` FOREIGN KEY (`audited_by_user_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

--
-- Constraints for table `time_entries`
--
ALTER TABLE `time_entries`
  ADD CONSTRAINT `time_entries_approved_by_user_id_fkey` FOREIGN KEY (`approved_by_user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `time_entries_matter_id_fkey` FOREIGN KEY (`matter_id`) REFERENCES `matters` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT `time_entries_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

--
-- Constraints for table `trial_notebook_items`
--
ALTER TABLE `trial_notebook_items`
  ADD CONSTRAINT `trial_notebook_items_litigation_case_id_fkey` FOREIGN KEY (`litigation_case_id`) REFERENCES `litigation_cases` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `trust_sub_ledgers`
--
ALTER TABLE `trust_sub_ledgers`
  ADD CONSTRAINT `trust_sub_ledgers_client_id_fkey` FOREIGN KEY (`client_id`) REFERENCES `clients` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT `trust_sub_ledgers_matter_id_fkey` FOREIGN KEY (`matter_id`) REFERENCES `matters` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

--
-- Constraints for table `trust_transactions`
--
ALTER TABLE `trust_transactions`
  ADD CONSTRAINT `trust_transactions_authorized_by_user_id_fkey` FOREIGN KEY (`authorized_by_user_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT `trust_transactions_trust_sub_ledger_id_fkey` FOREIGN KEY (`trust_sub_ledger_id`) REFERENCES `trust_sub_ledgers` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

--
-- Constraints for table `uscis_receipts`
--
ALTER TABLE `uscis_receipts`
  ADD CONSTRAINT `uscis_receipts_immigration_case_id_fkey` FOREIGN KEY (`immigration_case_id`) REFERENCES `immigration_cases` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `users`
--
ALTER TABLE `users`
  ADD CONSTRAINT `users_role_fkey` FOREIGN KEY (`role`) REFERENCES `roles` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

--
-- Constraints for table `workflow_stages`
--
ALTER TABLE `workflow_stages`
  ADD CONSTRAINT `workflow_stages_practice_area_id_fkey` FOREIGN KEY (`practice_area_id`) REFERENCES `practice_areas` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
