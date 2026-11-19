-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Nov 19, 2026 at 07:06 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `legal-db`
--

-- --------------------------------------------------------

--
-- Table structure for table `appeals_cases`
--

CREATE TABLE `appeals_cases` (
  `id` varchar(36) NOT NULL,
  `matter_id` varchar(36) NOT NULL,
  `appellate_court` varchar(150) NOT NULL DEFAULT 'Utah Court of Appeals',
  `appellate_docket_number` varchar(100) DEFAULT NULL,
  `lower_court_name` varchar(150) DEFAULT NULL,
  `lower_court_docket_number` varchar(100) DEFAULT NULL,
  `notice_of_appeal_date` date DEFAULT NULL,
  `record_due_deadline` date DEFAULT NULL,
  `opening_brief_deadline` date DEFAULT NULL,
  `reply_brief_deadline` date DEFAULT NULL,
  `oral_argument_date` datetime(3) DEFAULT NULL,
  `status` varchar(50) NOT NULL DEFAULT 'Notice Filed',
  `appellant_role` varchar(50) NOT NULL DEFAULT 'Appellant',
  `notes` text DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `audit_logs`
--

CREATE TABLE `audit_logs` (
  `id` varchar(36) NOT NULL,
  `user_id` varchar(36) DEFAULT NULL,
  `user_name` varchar(255) NOT NULL,
  `user_role` varchar(50) NOT NULL,
  `action` varchar(100) NOT NULL,
  `resource_type` varchar(50) NOT NULL,
  `resource_id` varchar(100) DEFAULT NULL,
  `details` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`details`)),
  `ip_address` varchar(50) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `timestamp` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `audit_logs`
--

INSERT INTO `audit_logs` (`id`, `user_id`, `user_name`, `user_role`, `action`, `resource_type`, `resource_id`, `details`, `ip_address`, `user_agent`, `timestamp`) VALUES
('00403eb5-224b-4b8e-a14b-8e92cc11d447', NULL, 'SYSTEM', 'SYSTEM', 'USER_LOGIN_FAILED', 'AUTH', NULL, '{\"email\":\"t.bludworth.1794560915288@utahslawyers.com\",\"reason\":\"USER_NOT_FOUND\"}', '::1', 'node', '2026-11-13 09:08:35.372'),
('01021e66-58a8-49eb-9eca-41c5c410f07d', '66c97d44-096b-4d34-8bd1-5691ba855e23', 'e.heugly@utahslawyers.com', 'super_admin', 'USER_ACTIVATED', 'USER', '1a1c1f3c-1a81-47aa-bad3-ec5fd76b9730', '{\"targetUserCode\":\"USR-002\",\"targetEmail\":\"t.bludworth.1794562683052@utahslawyers.com\",\"previousStatus\":\"Inactive\",\"newStatus\":\"Active\"}', '::1', 'node', '2026-11-13 09:38:04.239'),
('06a92196-a444-411e-8644-fbe1b9200caf', '66c97d44-096b-4d34-8bd1-5691ba855e23', 'SYSTEM', 'super_admin', 'TASK_STATUS_UPDATED', 'TASK', '43e45f0c-320c-46e1-9e49-6a290c9f68d5', '{\"taskCode\":\"TSK-26-0003\",\"status\":\"In Progress\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36', '2026-11-18 06:51:49.992'),
('07444a39-21a3-4fc2-a664-0578ce71d241', '8640f71a-0142-42f4-a4c0-732537dcd9b7', 'Thomas Bludworth, Esq.', 'attorney', 'USER_LOGIN_SUCCESS', 'AUTH', '8640f71a-0142-42f4-a4c0-732537dcd9b7', '{\"email\":\"t.bludworth@utahslawyers.com\",\"role\":\"attorney\",\"rememberMe\":false}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36', '2026-11-14 07:06:33.507'),
('075f4e65-b95c-426d-b885-d45098a590d9', '66c97d44-096b-4d34-8bd1-5691ba855e23', 'Eleanor Heugly, Esq.', 'super_admin', 'USER_LOGIN_SUCCESS', 'AUTH', '66c97d44-096b-4d34-8bd1-5691ba855e23', '{\"email\":\"e.heugly@utahslawyers.com\",\"role\":\"super_admin\",\"rememberMe\":false}', '::1', 'node', '2026-11-13 10:39:14.182'),
('0817d639-79b1-4fd2-a21a-0de5b7c3e0ba', NULL, 'Thomas Bludworth, Esq.', 'attorney', 'USER_LOGIN_SUCCESS', 'AUTH', '27d2ec04-9857-433b-aca6-09cb486c138a', '{\"email\":\"t.bludworth.1794566745371@utahslawyers.com\",\"role\":\"attorney\",\"rememberMe\":false}', '::1', 'node', '2026-11-13 10:45:46.093'),
('09348051-d82d-45c5-a463-629778533279', '66c97d44-096b-4d34-8bd1-5691ba855e23', 'SYSTEM', 'super_admin', 'TASK_CREATED', 'TASK', 'd48f581c-1564-4a47-8e4c-a165590710c7', '{\"taskCode\":\"TSK-26-0002\",\"title\":\"Follow-up: Missing Adverse Insurance Claim Number\",\"matterNumber\":\"26-CIV-0102\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36', '2026-11-17 07:28:30.089'),
('09366824-e341-4515-9021-919ed8fc93bd', '66c97d44-096b-4d34-8bd1-5691ba855e23', 'Eleanor Heugly, Esq.', 'super_admin', 'USER_LOGIN_SUCCESS', 'AUTH', '66c97d44-096b-4d34-8bd1-5691ba855e23', '{\"email\":\"e.heugly@utahslawyers.com\",\"role\":\"super_admin\",\"rememberMe\":false}', '::1', NULL, '2026-11-14 08:30:32.542'),
('0d28cac2-7949-4ac2-9ba4-dc910ed514e7', '66c97d44-096b-4d34-8bd1-5691ba855e23', 'Eleanor Heugly, Esq.', 'super_admin', 'TOKEN_REFRESH_SUCCESS', 'AUTH', '66c97d44-096b-4d34-8bd1-5691ba855e23', 'null', '::1', 'node', '2026-11-13 09:39:28.452'),
('11c08ede-368d-400f-ab7c-420afafac2eb', '66c97d44-096b-4d34-8bd1-5691ba855e23', 'SYSTEM', 'super_admin', 'DOCUMENT_VERSION_UPLOADED', 'DOCUMENT', '15cea455-bca3-4149-acc2-eeb056baa9d6', '{\"documentCode\":\"DOC-26-0001\",\"versionLabel\":\"v1.0\",\"fileName\":\"Iridescent Neon Glass Orb-2.png\",\"sha256\":\"e2e552d064e626bbf08b89b43576622d0edb951f772a68a63757e94bb28ed538\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36', '2026-11-17 06:51:11.358'),
('12764335-7a2f-4a15-b535-0c0e1668501b', '66c97d44-096b-4d34-8bd1-5691ba855e23', 'SYSTEM', 'super_admin', 'DOCUMENT_CREATED', 'DOCUMENT', 'a07b0759-426b-43e4-802d-08be2c30b698', '{\"documentCode\":\"DOC-26-0003\",\"title\":\"fewewf\",\"matterNumber\":\"26-CIV-0101\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36', '2026-11-17 07:12:17.414'),
('12c73b49-be34-4a0f-a4ec-b53f5ebcc704', '66c97d44-096b-4d34-8bd1-5691ba855e23', 'Eleanor Heugly, Esq.', 'super_admin', 'TOKEN_REFRESH_SUCCESS', 'AUTH', '66c97d44-096b-4d34-8bd1-5691ba855e23', 'null', '::1', 'node', '2026-11-13 09:38:03.042'),
('139f188a-0564-4f5f-81dd-aa2f300b3451', '66c97d44-096b-4d34-8bd1-5691ba855e23', 'e.heugly@utahslawyers.com', 'super_admin', 'USER_CREATED', 'USER', '42cac778-c2e8-489d-9582-6bd1640aa4e9', '{\"userCode\":\"USR-004\",\"email\":\"t.bludworth.1794566658893@utahslawyers.com\",\"name\":\"Thomas Bludworth, Esq.\",\"role\":\"attorney\",\"status\":\"Active\"}', '::1', 'node', '2026-11-13 10:44:19.251'),
('13e0f2ef-3214-4231-8468-6a0a379cbff2', NULL, 'Thomas Bludworth, Esq.', 'attorney', 'USER_LOGIN_SUCCESS', 'AUTH', '27d2ec04-9857-433b-aca6-09cb486c138a', '{\"email\":\"t.bludworth.1794566745371@utahslawyers.com\",\"role\":\"attorney\",\"rememberMe\":false}', '::1', 'node', '2026-11-13 10:45:46.896'),
('1448ca8f-1a34-4bb3-a2e6-8c3bd13090d0', '66c97d44-096b-4d34-8bd1-5691ba855e23', 'SYSTEM', 'super_admin', 'DOCUMENT_CREATED', 'DOCUMENT', '71e3dc71-2720-4813-b3ee-7061615fae5d', '{\"documentCode\":\"DOC-26-0002\",\"title\":\"4ed\",\"matterNumber\":\"26-CIV-0102\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36', '2026-11-17 06:51:54.649'),
('15c7d6e7-6b1f-4a2c-a32c-8de8b977f1fc', '8640f71a-0142-42f4-a4c0-732537dcd9b7', 'Thomas Bludworth, Esq.', 'attorney', 'USER_LOGIN_SUCCESS', 'AUTH', '8640f71a-0142-42f4-a4c0-732537dcd9b7', '{\"email\":\"t.bludworth@utahslawyers.com\",\"role\":\"attorney\",\"rememberMe\":false}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36', '2026-11-14 07:59:45.484'),
('167fff65-0d32-4a73-b595-f2138901b613', '66c97d44-096b-4d34-8bd1-5691ba855e23', 'e.heugly@utahslawyers.com', 'super_admin', 'USER_DEACTIVATED', 'USER', '1a1c1f3c-1a81-47aa-bad3-ec5fd76b9730', '{\"targetUserCode\":\"USR-002\",\"targetEmail\":\"t.bludworth.1794562683052@utahslawyers.com\",\"previousStatus\":\"Active\",\"newStatus\":\"Inactive\"}', '::1', 'node', '2026-11-13 09:38:04.194'),
('17ed65f7-0e3f-4d3a-8855-a0a5bf8368fe', 'eca5d99f-a1cd-43f8-82f2-830acd1a5ddc', 'David Sterling, Esq.', 'supervisor', 'USER_LOGIN_SUCCESS', 'AUTH', 'eca5d99f-a1cd-43f8-82f2-830acd1a5ddc', '{\"email\":\"d.sterling@utahslawyers.com\",\"role\":\"supervisor\",\"rememberMe\":false}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36', '2026-11-14 08:30:45.889'),
('1976f2eb-5a6c-4bf8-bc4d-9b556f67df2a', '66c97d44-096b-4d34-8bd1-5691ba855e23', 'Eleanor Heugly, Esq.', 'super_admin', 'USER_LOGIN_SUCCESS', 'AUTH', '66c97d44-096b-4d34-8bd1-5691ba855e23', '{\"email\":\"e.heugly@utahslawyers.com\",\"role\":\"super_admin\",\"rememberMe\":false}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36', '2026-11-17 06:41:51.534'),
('19a11c94-02e2-4659-a1e8-4f16e1c1eac0', '66c97d44-096b-4d34-8bd1-5691ba855e23', 'e.heugly@utahslawyers.com', 'super_admin', 'MATTER_PANELS_SAVED', 'MATTER', 'aa405321-481d-4c3c-bd56-ba1fede8e4d7', '{\"matterNumber\":\"26-CIV-0102\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36', '2026-11-18 09:39:06.640'),
('1abf454d-3fa1-4670-a925-5e3d3c6da40c', '66c97d44-096b-4d34-8bd1-5691ba855e23', 'e.heugly@utahslawyers.com', 'super_admin', 'MATTER_CREATED', 'MATTER', 'aa405321-481d-4c3c-bd56-ba1fede8e4d7', '{\"matterNumber\":\"26-CIV-0102\",\"title\":\"tester\",\"clientName\":\"fsd\",\"practiceArea\":\"Civil/Commercial Litigation\",\"billingType\":\"Hourly\",\"isEthicalWallEnabled\":false}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36', '2026-11-17 06:49:20.894'),
('1f9e565a-b852-4946-b321-9b9cfe84e516', NULL, 'Thomas Bludworth, Esq.', 'attorney', 'USER_LOGIN_BLOCKED', 'AUTH', '27d2ec04-9857-433b-aca6-09cb486c138a', '{\"email\":\"t.bludworth.1794566745371@utahslawyers.com\",\"status\":\"Inactive\"}', '::1', 'node', '2026-11-13 10:45:46.166'),
('1ff4d2fa-a686-4df1-95eb-0770ccadfadf', 'a0b374d7-a8b4-4d42-b4c1-909094f4598b', 'Marcus Vance', 'paralegal', 'USER_LOGIN_SUCCESS', 'AUTH', 'a0b374d7-a8b4-4d42-b4c1-909094f4598b', '{\"email\":\"m.vance@utahslawyers.com\",\"role\":\"paralegal\",\"rememberMe\":false}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36', '2026-11-14 08:31:00.871'),
('21f36439-2d61-425e-80b9-5fbb4ddb4d41', '1a1c1f3c-1a81-47aa-bad3-ec5fd76b9730', 'Thomas Bludworth, Esq.', 'attorney', 'PASSWORD_RESET_REQUESTED', 'AUTH', '1a1c1f3c-1a81-47aa-bad3-ec5fd76b9730', '{\"email\":\"t.bludworth.1794562683052@utahslawyers.com\"}', '::1', 'node', '2026-11-13 09:38:04.251'),
('22c68f97-2b14-4d66-996a-1e99ec0139b4', '66c97d44-096b-4d34-8bd1-5691ba855e23', 'SYSTEM', 'super_admin', 'TASK_STATUS_UPDATED', 'TASK', '43e45f0c-320c-46e1-9e49-6a290c9f68d5', '{\"taskCode\":\"TSK-26-0003\",\"status\":\"Completed\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36', '2026-11-18 06:51:52.077'),
('28c69914-f780-4b52-a5bb-bb66344d4f8c', '66c97d44-096b-4d34-8bd1-5691ba855e23', 'Eleanor Heugly, Esq.', 'super_admin', 'USER_LOGIN_SUCCESS', 'AUTH', '66c97d44-096b-4d34-8bd1-5691ba855e23', '{\"email\":\"e.heugly@utahslawyers.com\",\"role\":\"super_admin\",\"rememberMe\":false}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36', '2026-11-18 06:48:54.378'),
('2adb5a50-8acb-4b6a-ac0f-d23995058e1b', '66c97d44-096b-4d34-8bd1-5691ba855e23', 'SYSTEM', 'super_admin', 'CALENDAR_EVENT_CREATED', 'CALENDAR', 'a42304b7-7446-4cd6-9a6e-829e94df7c0a', '{\"title\":\"aZX\",\"eventType\":\"Hearing\",\"startTime\":\"2026-11-20T03:30:00.000Z\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36', '2026-11-18 07:25:21.397'),
('2e9dd869-5112-466e-8728-a5b6c6718482', '66c97d44-096b-4d34-8bd1-5691ba855e23', 'SYSTEM', 'super_admin', 'TASK_CREATED', 'TASK', 'a01d36c7-9027-432f-a722-99a6f30430d3', '{\"taskCode\":\"TSK-26-0004\",\"title\":\"aszxdcxz\",\"matterNumber\":\"26-CIV-0102\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36', '2026-11-18 07:21:47.061'),
('351aba39-57cf-4273-8f45-1fc113e3ed0a', '66c97d44-096b-4d34-8bd1-5691ba855e23', 'e.heugly@utahslawyers.com', 'super_admin', 'USER_ACTIVATED', 'USER', '7927e70e-a2b7-4a10-933f-24e0e9227c97', '{\"targetUserCode\":\"USR-004\",\"targetEmail\":\"t.bludworth.1794566354234@utahslawyers.com\",\"previousStatus\":\"Inactive\",\"newStatus\":\"Active\"}', '::1', 'node', '2026-11-13 10:39:14.991'),
('36a14eac-f7c4-4012-aef9-1460a67a9407', 'af3744b3-df06-4041-bc27-b8d16a8903d7', 'Thomas Bludworth, Esq.', 'attorney', 'USER_LOGIN_BLOCKED', 'AUTH', 'af3744b3-df06-4041-bc27-b8d16a8903d7', '{\"email\":\"t.bludworth.1794562768462@utahslawyers.com\",\"status\":\"Inactive\"}', '::1', 'node', '2026-11-13 09:39:29.395'),
('376cac41-5e14-40d9-bfbd-7e86a1a9e82d', NULL, 'SYSTEM', 'SYSTEM', 'USER_LOGIN_FAILED', 'AUTH', NULL, '{\"email\":\"t.bludworth@utahslawyers.com\",\"reason\":\"USER_NOT_FOUND\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36', '2026-11-14 07:02:24.249'),
('3821486d-1e76-4a5f-a081-ca39f43a5316', '66c97d44-096b-4d34-8bd1-5691ba855e23', 'Eleanor Heugly, Esq.', 'super_admin', 'USER_LOGIN_SUCCESS', 'AUTH', '66c97d44-096b-4d34-8bd1-5691ba855e23', '{\"email\":\"e.heugly@utahslawyers.com\",\"role\":\"super_admin\",\"rememberMe\":false}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36', '2026-11-19 05:54:16.720'),
('382a4126-d0f9-4295-8704-3c7511b723e0', '66c97d44-096b-4d34-8bd1-5691ba855e23', 'Eleanor Heugly, Esq.', 'super_admin', 'TOKEN_REFRESH_SUCCESS', 'AUTH', '66c97d44-096b-4d34-8bd1-5691ba855e23', 'null', '::1', 'node', '2026-11-13 10:45:45.359'),
('383ad138-2cdf-40b5-9cc1-2c41c64af3c8', NULL, 'Thomas Bludworth, Esq.', 'attorney', 'PASSWORD_RESET_COMPLETED', 'AUTH', '7927e70e-a2b7-4a10-933f-24e0e9227c97', '{\"email\":\"t.bludworth.1794566354234@utahslawyers.com\"}', '::1', 'node', '2026-11-13 10:39:15.325'),
('39aa0434-22ae-4953-9970-bcc2e73b3a86', '66c97d44-096b-4d34-8bd1-5691ba855e23', 'Eleanor Heugly, Esq.', 'super_admin', 'USER_LOGIN_SUCCESS', 'AUTH', '66c97d44-096b-4d34-8bd1-5691ba855e23', '{\"email\":\"e.heugly@utahslawyers.com\",\"role\":\"super_admin\",\"rememberMe\":false}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36', '2026-11-14 09:03:50.599'),
('39b8e88e-8556-4fd7-bcbf-5a5f7bc213ba', '66c97d44-096b-4d34-8bd1-5691ba855e23', 'SYSTEM', 'super_admin', 'TASK_CREATED', 'TASK', '43e45f0c-320c-46e1-9e49-6a290c9f68d5', '{\"taskCode\":\"TSK-26-0003\",\"title\":\"frsdewf\",\"matterNumber\":\"26-CIV-0102\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36', '2026-11-18 06:51:29.152'),
('3dd6463a-7e9d-4dbf-9ab2-95c1569464f9', NULL, 'SYSTEM', 'SYSTEM', 'USER_LOGIN_FAILED', 'AUTH', NULL, '{\"email\":\"t.bludworth.1794560915288@utahslawyers.com\",\"reason\":\"USER_NOT_FOUND\"}', '::1', 'node', '2026-11-13 09:08:35.421'),
('3f3c83bd-2af5-4066-a946-e85e2270b904', '66c97d44-096b-4d34-8bd1-5691ba855e23', 'e.heugly@utahslawyers.com', 'super_admin', 'USER_DEACTIVATED', 'USER', '27d2ec04-9857-433b-aca6-09cb486c138a', '{\"targetUserCode\":\"USR-004\",\"targetEmail\":\"t.bludworth.1794566745371@utahslawyers.com\",\"previousStatus\":\"Active\",\"newStatus\":\"Inactive\"}', '::1', 'node', '2026-11-13 10:45:46.144'),
('3f8fbd33-23e1-4164-9974-fdf8045e9474', '66c97d44-096b-4d34-8bd1-5691ba855e23', 'Eleanor Heugly, Esq.', 'super_admin', 'USER_LOGIN_SUCCESS', 'AUTH', '66c97d44-096b-4d34-8bd1-5691ba855e23', '{\"email\":\"e.heugly@utahslawyers.com\",\"role\":\"super_admin\",\"rememberMe\":false}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36', '2026-11-17 07:04:26.354'),
('401ecf18-04fb-46be-8972-d3dc5312c0b5', '1a1c1f3c-1a81-47aa-bad3-ec5fd76b9730', 'Thomas Bludworth, Esq.', 'attorney', 'USER_LOGIN_BLOCKED', 'AUTH', '1a1c1f3c-1a81-47aa-bad3-ec5fd76b9730', '{\"email\":\"t.bludworth.1794562683052@utahslawyers.com\",\"status\":\"Inactive\"}', '::1', 'node', '2026-11-13 09:38:04.217'),
('42b032aa-e0e8-4e3b-8017-5336fc319b2f', '66c97d44-096b-4d34-8bd1-5691ba855e23', 'Eleanor Heugly, Esq.', 'super_admin', 'USER_LOGIN_FAILED', 'AUTH', '66c97d44-096b-4d34-8bd1-5691ba855e23', '{\"email\":\"e.heugly@utahslawyers.com\",\"reason\":\"INVALID_PASSWORD\"}', '::1', 'node', '2026-11-13 10:45:44.959'),
('44f1209f-c6b7-4c52-b109-8ed4fbdb241e', '66c97d44-096b-4d34-8bd1-5691ba855e23', 'Eleanor Heugly, Esq.', 'super_admin', 'USER_LOGIN_FAILED', 'AUTH', '66c97d44-096b-4d34-8bd1-5691ba855e23', '{\"email\":\"e.heugly@utahslawyers.com\",\"reason\":\"INVALID_PASSWORD\"}', '::1', 'node', '2026-11-13 10:44:18.429'),
('46c82e08-9de8-477d-9dee-5649e8d045f8', NULL, 'Thomas Bludworth, Esq.', 'attorney', 'USER_LOGIN_SUCCESS', 'AUTH', '42cac778-c2e8-489d-9582-6bd1640aa4e9', '{\"email\":\"t.bludworth.1794566658893@utahslawyers.com\",\"role\":\"attorney\",\"rememberMe\":false}', '::1', 'node', '2026-11-13 10:44:20.286'),
('4810d77e-454b-4a99-87f4-9047a92a6945', '66c97d44-096b-4d34-8bd1-5691ba855e23', 'e.heugly@utahslawyers.com', 'super_admin', 'USER_CREATED', 'USER', '7927e70e-a2b7-4a10-933f-24e0e9227c97', '{\"userCode\":\"USR-004\",\"email\":\"t.bludworth.1794566354234@utahslawyers.com\",\"name\":\"Thomas Bludworth, Esq.\",\"role\":\"attorney\",\"status\":\"Active\"}', '::1', 'node', '2026-11-13 10:39:14.598'),
('4843d93d-f5eb-4fd1-a4e2-481e0a92298b', NULL, 'Thomas Bludworth, Esq.', 'attorney', 'PASSWORD_RESET_COMPLETED', 'AUTH', '27d2ec04-9857-433b-aca6-09cb486c138a', '{\"email\":\"t.bludworth.1794566745371@utahslawyers.com\"}', '::1', 'node', '2026-11-13 10:45:46.533'),
('48531cae-0e09-44df-91ae-93fa28a73eaf', '66c97d44-096b-4d34-8bd1-5691ba855e23', 'Eleanor Heugly, Esq.', 'super_admin', 'USER_LOGIN_SUCCESS', 'AUTH', '66c97d44-096b-4d34-8bd1-5691ba855e23', '{\"email\":\"e.heugly@utahslawyers.com\",\"role\":\"super_admin\",\"rememberMe\":false}', '::1', NULL, '2026-11-14 08:31:00.988'),
('49ceaf10-70fd-483c-a93f-63f7fe555135', 'af3744b3-df06-4041-bc27-b8d16a8903d7', 'Thomas Bludworth, Esq.', 'attorney', 'PASSWORD_RESET_COMPLETED', 'AUTH', 'af3744b3-df06-4041-bc27-b8d16a8903d7', '{\"email\":\"t.bludworth.1794562768462@utahslawyers.com\"}', '::1', 'node', '2026-11-13 09:39:29.834'),
('4a1e1180-d976-4dd5-ad7e-6330741f34f7', '66c97d44-096b-4d34-8bd1-5691ba855e23', 'e.heugly@utahslawyers.com', 'super_admin', 'USER_DEACTIVATED', 'USER', '27d2ec04-9857-433b-aca6-09cb486c138a', '{\"targetUserCode\":\"USR-004\",\"targetEmail\":\"t.bludworth.1794566745371@utahslawyers.com\",\"previousStatus\":\"Active\",\"newStatus\":\"Inactive\"}', '::1', 'node', '2026-11-13 10:45:46.959'),
('4c0f5038-2755-4845-b3e3-72ed120a8436', '66c97d44-096b-4d34-8bd1-5691ba855e23', 'e.heugly@utahslawyers.com', 'super_admin', 'USER_CREATED', 'USER', '1a1c1f3c-1a81-47aa-bad3-ec5fd76b9730', '{\"userCode\":\"USR-002\",\"email\":\"t.bludworth.1794562683052@utahslawyers.com\",\"name\":\"Thomas Bludworth, Esq.\",\"role\":\"attorney\",\"status\":\"Active\"}', '::1', 'node', '2026-11-13 09:38:03.619'),
('4e45dd53-3b4e-4103-8a43-240202ff338c', '66c97d44-096b-4d34-8bd1-5691ba855e23', 'e.heugly@utahslawyers.com', 'super_admin', 'MATTER_CREATED', 'MATTER', 'd9de7ced-2cd9-43e4-82c7-935865345c4e', '{\"matterNumber\":\"26-CIV-0101\",\"title\":\"demo\",\"clientName\":\"fsd\",\"practiceArea\":\"Civil/Commercial Litigation\",\"billingType\":\"Hourly\",\"isEthicalWallEnabled\":true}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36', '2026-11-14 06:39:54.276'),
('4e6c14eb-36b0-47fa-8db0-8342c8980f2c', '66c97d44-096b-4d34-8bd1-5691ba855e23', 'Eleanor Heugly, Esq.', 'super_admin', 'USER_LOGIN_SUCCESS', 'AUTH', '66c97d44-096b-4d34-8bd1-5691ba855e23', '{\"email\":\"e.heugly@utahslawyers.com\",\"role\":\"super_admin\",\"rememberMe\":false}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36', '2026-11-18 09:50:39.717'),
('4eac3794-1e19-4a81-84eb-45fba6e8a17c', NULL, 'SYSTEM', 'SYSTEM', 'USER_LOGIN_FAILED', 'AUTH', NULL, '{\"email\":\"e.heugly@utahslawyers.com\",\"reason\":\"USER_NOT_FOUND\"}', '::1', 'node', '2026-11-13 09:08:35.241'),
('4f216173-cc70-4af8-9856-c32cf0420842', '66c97d44-096b-4d34-8bd1-5691ba855e23', 'SYSTEM', 'super_admin', 'DOCUMENT_VERSION_UPLOADED', 'DOCUMENT', 'a07b0759-426b-43e4-802d-08be2c30b698', '{\"documentCode\":\"DOC-26-0003\",\"versionLabel\":\"v1.0\",\"fileName\":\"ui-flow.pdf\",\"sha256\":\"26df269a364e96fdc072d4728ced32ca656c0b9c4204857086df7ecd933b51c1\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36', '2026-11-17 07:12:17.595'),
('5096379b-06a2-4203-885b-831760bedb3b', '66c97d44-096b-4d34-8bd1-5691ba855e23', 'SYSTEM', 'SYSTEM', 'CREATE', 'tasks', 'b409329c-3efa-4ff4-ae40-051028509900', '{\"purpose\":\"DOCUMENT_MISSING_INFO_FOLLOWUP\",\"matterId\":\"aa405321-481d-4c3c-bd56-ba1fede8e4d7\",\"taskCode\":\"TSK-26-0001\",\"missingField\":{\"placeholderTag\":\"Insurance.AdjusterName\",\"sourceEntity\":\"Insurance\",\"sourceField\":\"adjusterName\",\"description\":\"Required field \'Insurance.adjusterName\' is missing or empty in matter records.\"}}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36', '2026-11-17 07:28:28.447'),
('51fc5a47-1528-488f-a729-1a4e2a783cc8', NULL, 'Thomas Bludworth, Esq.', 'attorney', 'PASSWORD_RESET_COMPLETED', 'AUTH', '42cac778-c2e8-489d-9582-6bd1640aa4e9', '{\"email\":\"t.bludworth.1794566658893@utahslawyers.com\"}', '::1', 'node', '2026-11-13 10:44:19.971'),
('553ef73f-9366-41db-b750-24ceeccfd68a', '66c97d44-096b-4d34-8bd1-5691ba855e23', 'SYSTEM', 'super_admin', 'TASK_CREATED', 'TASK', '6a113ac5-0036-457d-b559-94546e64af29', '{\"taskCode\":\"TSK-26-0005\",\"title\":\"sxzx\",\"matterNumber\":\"26-CIV-0102\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36', '2026-11-18 07:22:23.320'),
('5a1566de-aa25-436d-b63c-b6d3626bcc68', '66c97d44-096b-4d34-8bd1-5691ba855e23', 'Eleanor Heugly, Esq.', 'super_admin', 'USER_LOGIN_SUCCESS', 'AUTH', '66c97d44-096b-4d34-8bd1-5691ba855e23', '{\"email\":\"e.heugly@utahslawyers.com\",\"role\":\"super_admin\",\"rememberMe\":false}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36', '2026-11-18 07:49:43.562'),
('5bd3d1a8-d025-4fd2-bcf3-285c488344bb', '66c97d44-096b-4d34-8bd1-5691ba855e23', 'Eleanor Heugly, Esq.', 'super_admin', 'USER_LOGIN_SUCCESS', 'AUTH', '66c97d44-096b-4d34-8bd1-5691ba855e23', '{\"email\":\"e.heugly@utahslawyers.com\",\"role\":\"super_admin\",\"rememberMe\":false}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36', '2026-11-14 08:48:24.928'),
('5d42b021-04fd-4f06-8a2c-d0dacfff1999', NULL, 'SYSTEM', 'SYSTEM', 'USER_LOGIN_FAILED', 'AUTH', NULL, '{\"email\":\"t.bludworth@utahslawyers.com\",\"reason\":\"USER_NOT_FOUND\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36', '2026-11-14 07:00:06.022'),
('6001dbb8-fc7b-42b2-8725-b26054601125', NULL, 'SYSTEM', 'SYSTEM', 'USER_LOGIN_FAILED', 'AUTH', NULL, '{\"email\":\"t.bludworth@utahslawyers.com\",\"reason\":\"USER_NOT_FOUND\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36', '2026-11-14 05:15:34.634'),
('601f6003-0f06-4c3e-96ee-499f23df13e6', '66c97d44-096b-4d34-8bd1-5691ba855e23', 'SYSTEM', 'super_admin', 'TASK_STATUS_UPDATED', 'TASK', '24a07424-8588-4fd0-9042-f1eb3e16bb10', '{\"taskCode\":\"TSK-26-0003\",\"status\":\"Completed\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36', '2026-11-18 07:21:31.365'),
('61f700b1-393c-413e-a22d-fbed828ecca5', '66c97d44-096b-4d34-8bd1-5691ba855e23', 'e.heugly@utahslawyers.com', 'super_admin', 'MATTER_PANELS_SAVED', 'MATTER', 'aa405321-481d-4c3c-bd56-ba1fede8e4d7', '{\"matterNumber\":\"26-CIV-0102\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36', '2026-11-18 09:37:21.996'),
('623e275c-e502-46be-baa2-76bd3958d4d8', '66c97d44-096b-4d34-8bd1-5691ba855e23', 'Eleanor Heugly, Esq.', 'super_admin', 'USER_LOGIN_SUCCESS', 'AUTH', '66c97d44-096b-4d34-8bd1-5691ba855e23', '{\"email\":\"e.heugly@utahslawyers.com\",\"role\":\"super_admin\",\"rememberMe\":false}', '::1', 'node', '2026-11-14 07:03:05.236'),
('63007ea0-40e2-4951-b353-62ecc89e64e7', NULL, 'Thomas Bludworth, Esq.', 'attorney', 'USER_LOGIN_SUCCESS', 'AUTH', '42cac778-c2e8-489d-9582-6bd1640aa4e9', '{\"email\":\"t.bludworth.1794566658893@utahslawyers.com\",\"role\":\"attorney\",\"rememberMe\":false}', '::1', 'node', '2026-11-13 10:44:19.570'),
('633c663e-3884-4a02-9745-7b6268e39fe1', '66c97d44-096b-4d34-8bd1-5691ba855e23', 'Eleanor Heugly, Esq.', 'super_admin', 'USER_LOGIN_SUCCESS', 'AUTH', '66c97d44-096b-4d34-8bd1-5691ba855e23', '{\"email\":\"e.heugly@utahslawyers.com\",\"role\":\"super_admin\",\"rememberMe\":false}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36', '2026-11-14 06:47:18.131'),
('65cc1c65-f6f4-4d2a-9769-a09efe951e3a', '66c97d44-096b-4d34-8bd1-5691ba855e23', 'Eleanor Heugly, Esq.', 'super_admin', 'USER_LOGIN_SUCCESS', 'AUTH', '66c97d44-096b-4d34-8bd1-5691ba855e23', '{\"email\":\"e.heugly@utahslawyers.com\",\"role\":\"super_admin\",\"rememberMe\":false}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36', '2026-11-18 05:49:54.453'),
('6766d9bf-3d33-48a8-bf5c-6c46cb613215', '66c97d44-096b-4d34-8bd1-5691ba855e23', 'Eleanor Heugly, Esq.', 'super_admin', 'FIRST_SUPER_ADMIN_PROVISIONED', 'SECURITY', '66c97d44-096b-4d34-8bd1-5691ba855e23', '{\"userCode\":\"USR-001\",\"email\":\"e.heugly@utahslawyers.com\",\"name\":\"Eleanor Heugly, Esq.\",\"role\":\"super_admin\",\"provisionedVia\":\"CLI_SCRIPT\"}', NULL, NULL, '2026-11-13 09:37:40.356'),
('68699131-7269-485b-842e-a1f96ae8ec1b', '66c97d44-096b-4d34-8bd1-5691ba855e23', 'SYSTEM', 'super_admin', 'INVOICE_GENERATED', 'BILLING', 'c07f704a-378d-4de1-968f-c242b4b4cde1', '{\"invoiceNumber\":\"INV-26-0001\",\"totalAmount\":4850,\"matterNumber\":\"26-CIV-0102\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36', '2026-11-18 07:51:44.375'),
('6ce5f875-f647-48da-bafd-68e83edfb92f', '66c97d44-096b-4d34-8bd1-5691ba855e23', 'Eleanor Heugly, Esq.', 'super_admin', 'USER_LOGIN_SUCCESS', 'AUTH', '66c97d44-096b-4d34-8bd1-5691ba855e23', '{\"email\":\"e.heugly@utahslawyers.com\",\"role\":\"super_admin\",\"rememberMe\":false}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36', '2026-11-14 06:32:01.893'),
('6e1dc362-06e4-4104-8b63-40d67492f91c', '66c97d44-096b-4d34-8bd1-5691ba855e23', 'Eleanor Heugly, Esq.', 'super_admin', 'USER_LOGIN_SUCCESS', 'AUTH', '66c97d44-096b-4d34-8bd1-5691ba855e23', '{\"email\":\"e.heugly@utahslawyers.com\",\"role\":\"super_admin\",\"rememberMe\":false}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36', '2026-11-13 12:47:55.777'),
('6ec6ab53-a5d2-44a8-a4bd-fdd1027b46f5', NULL, 'Thomas Bludworth, Esq.', 'attorney', 'PASSWORD_RESET_REQUESTED', 'AUTH', '27d2ec04-9857-433b-aca6-09cb486c138a', '{\"email\":\"t.bludworth.1794566745371@utahslawyers.com\"}', '::1', 'node', '2026-11-13 10:45:46.214'),
('71e3f538-aa37-4d08-85ac-e2f6ec7c3b2b', '66c97d44-096b-4d34-8bd1-5691ba855e23', 'e.heugly@utahslawyers.com', 'super_admin', 'MATTER_UPDATED', 'MATTER', 'aa405321-481d-4c3c-bd56-ba1fede8e4d7', '{\"matterNumber\":\"26-CIV-0102\",\"changes\":{\"status\":\"Active\"}}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36', '2026-11-18 09:37:21.984'),
('751ff857-e1c4-4d82-8ce8-4ea712dee9e0', '66c97d44-096b-4d34-8bd1-5691ba855e23', 'Eleanor Heugly, Esq.', 'super_admin', 'USER_LOGIN_SUCCESS', 'AUTH', '66c97d44-096b-4d34-8bd1-5691ba855e23', '{\"email\":\"e.heugly@utahslawyers.com\",\"role\":\"super_admin\",\"rememberMe\":false}', '::1', 'node', '2026-11-13 10:44:18.841'),
('7577ad41-2953-4297-95d8-507eec35bae7', NULL, 'Thomas Bludworth, Esq.', 'attorney', 'PASSWORD_RESET_REQUESTED', 'AUTH', '42cac778-c2e8-489d-9582-6bd1640aa4e9', '{\"email\":\"t.bludworth.1794566658893@utahslawyers.com\"}', '::1', 'node', '2026-11-13 10:44:19.664'),
('75d923c8-242f-419d-8f2f-8289eb14a7b7', '66c97d44-096b-4d34-8bd1-5691ba855e23', 'e.heugly@utahslawyers.com', 'super_admin', 'MATTER_UPDATED', 'MATTER', 'aa405321-481d-4c3c-bd56-ba1fede8e4d7', '{\"matterNumber\":\"26-CIV-0102\",\"changes\":{\"status\":\"Active\"}}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36', '2026-11-18 09:39:06.638'),
('7705d915-b09d-4ab4-8ee3-81f50d17c197', '8640f71a-0142-42f4-a4c0-732537dcd9b7', 'Thomas Bludworth, Esq.', 'attorney', 'USER_LOGIN_SUCCESS', 'AUTH', '8640f71a-0142-42f4-a4c0-732537dcd9b7', '{\"email\":\"t.bludworth@utahslawyers.com\",\"role\":\"attorney\",\"rememberMe\":false}', '::1', 'node', '2026-11-14 07:03:05.682'),
('77d0bee0-55cf-4cf5-882d-2ce32adb25b0', '66c97d44-096b-4d34-8bd1-5691ba855e23', 'Eleanor Heugly, Esq.', 'super_admin', 'TOKEN_REFRESH_SUCCESS', 'AUTH', '66c97d44-096b-4d34-8bd1-5691ba855e23', 'null', '::1', 'node', '2026-11-13 10:39:14.223'),
('784ad792-d98f-4450-ae67-f4585a3aea24', '1a1c1f3c-1a81-47aa-bad3-ec5fd76b9730', 'SYSTEM', 'attorney', 'COMMUNICATION_LOGGED', 'COMMUNICATION', '2732e172-1ddf-41ae-bcd1-44ce5ccf5d53', '{\"subject\":\"Test Correspondence from verification script\",\"type\":\"Email\",\"matterId\":\"aa405321-481d-4c3c-bd56-ba1fede8e4d7\",\"clientId\":\"d7251bda-8b7d-44ba-9c98-0c2aab623b5f\"}', NULL, NULL, '2026-11-17 07:46:09.530'),
('7beef765-0cb9-4e0c-a2b6-c978d7c474bb', NULL, 'SYSTEM', 'SYSTEM', 'USER_LOGIN_FAILED', 'AUTH', NULL, '{\"email\":\"d.sterling@utahslawyers.com\",\"reason\":\"USER_NOT_FOUND\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36', '2026-11-14 06:56:43.632'),
('7ca2f605-1151-4843-b797-cddc1e5f848b', '66c97d44-096b-4d34-8bd1-5691ba855e23', 'Eleanor Heugly, Esq.', 'super_admin', 'TOKEN_REFRESH_SUCCESS', 'AUTH', '66c97d44-096b-4d34-8bd1-5691ba855e23', 'null', '::1', 'node', '2026-11-13 10:44:18.882'),
('8382e773-23a6-460e-ba55-b6c326bee38d', NULL, 'Thomas Bludworth, Esq.', 'attorney', 'USER_LOGIN_SUCCESS', 'AUTH', '7927e70e-a2b7-4a10-933f-24e0e9227c97', '{\"email\":\"t.bludworth.1794566354234@utahslawyers.com\",\"role\":\"attorney\",\"rememberMe\":false}', '::1', 'node', '2026-11-13 10:39:15.643'),
('884cad3a-5c40-4f30-bc66-0d1e4473a262', '1a1c1f3c-1a81-47aa-bad3-ec5fd76b9730', 'Thomas Bludworth, Esq.', 'attorney', 'USER_LOGIN_SUCCESS', 'AUTH', '1a1c1f3c-1a81-47aa-bad3-ec5fd76b9730', '{\"email\":\"t.bludworth.1794562683052@utahslawyers.com\",\"role\":\"attorney\",\"rememberMe\":false}', '::1', 'node', '2026-11-13 09:38:04.136'),
('8cce6ce0-0ef4-4378-b50a-4cfb01599363', '66c97d44-096b-4d34-8bd1-5691ba855e23', 'Eleanor Heugly, Esq.', 'super_admin', 'USER_LOGIN_SUCCESS', 'AUTH', '66c97d44-096b-4d34-8bd1-5691ba855e23', '{\"email\":\"e.heugly@utahslawyers.com\",\"role\":\"super_admin\",\"rememberMe\":false}', '::1', NULL, '2026-11-14 08:31:17.761'),
('9104c424-35c8-43f0-b43e-884e84df3c07', '66c97d44-096b-4d34-8bd1-5691ba855e23', 'Eleanor Heugly, Esq.', 'super_admin', 'USER_LOGIN_SUCCESS', 'AUTH', '66c97d44-096b-4d34-8bd1-5691ba855e23', '{\"email\":\"e.heugly@utahslawyers.com\",\"role\":\"super_admin\",\"rememberMe\":false}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36', '2026-11-13 12:36:13.313'),
('910e403c-3e81-4ddc-90a7-8905d8f24eca', '66c97d44-096b-4d34-8bd1-5691ba855e23', 'Eleanor Heugly, Esq.', 'super_admin', 'USER_LOGIN_SUCCESS', 'AUTH', '66c97d44-096b-4d34-8bd1-5691ba855e23', '{\"email\":\"e.heugly@utahslawyers.com\",\"role\":\"super_admin\",\"rememberMe\":false}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36', '2026-11-17 07:28:01.113'),
('91fc6f80-3fc0-4495-80ac-577bb2bf9108', 'b4144e13-e1b8-4c10-bc62-3ca0966380e0', 'Rachel Adams', 'billing', 'USER_LOGIN_SUCCESS', 'AUTH', 'b4144e13-e1b8-4c10-bc62-3ca0966380e0', '{\"email\":\"r.adams@utahslawyers.com\",\"role\":\"billing\",\"rememberMe\":false}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36', '2026-11-14 08:31:08.164'),
('93d70378-afc2-476f-9b7d-bb451b20d3ae', NULL, 'SYSTEM', 'SYSTEM', 'USER_LOGIN_FAILED', 'AUTH', NULL, '{\"email\":\"t.bludworth.1794560915288@utahslawyers.com\",\"reason\":\"USER_NOT_FOUND\"}', '::1', 'node', '2026-11-13 09:08:35.324'),
('9423fc3a-0199-4a22-b35c-d0a2eb14f9bd', '66c97d44-096b-4d34-8bd1-5691ba855e23', 'SYSTEM', 'super_admin', 'TASK_STATUS_UPDATED', 'TASK', '43e45f0c-320c-46e1-9e49-6a290c9f68d5', '{\"taskCode\":\"TSK-26-0003\",\"status\":\"Completed\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36', '2026-11-18 06:51:54.593'),
('94d32efb-e8b1-4706-b5d3-dbfaa87b1529', '66c97d44-096b-4d34-8bd1-5691ba855e23', 'SYSTEM', 'super_admin', 'TASK_DELETED', 'TASK', '43e45f0c-320c-46e1-9e49-6a290c9f68d5', '{\"taskCode\":\"TSK-26-0003\",\"title\":\"frsdewf\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36', '2026-11-18 06:51:59.413'),
('94de4771-3d22-466d-916a-83b0214eaa15', '66c97d44-096b-4d34-8bd1-5691ba855e23', 'e.heugly@utahslawyers.com', 'super_admin', 'MATTER_UPDATED', 'MATTER', 'aa405321-481d-4c3c-bd56-ba1fede8e4d7', '{\"matterNumber\":\"26-CIV-0102\",\"changes\":{\"status\":\"Active\"}}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36', '2026-11-18 09:51:15.768'),
('9796e315-b711-4853-814c-332802d2ff38', '66c97d44-096b-4d34-8bd1-5691ba855e23', 'e.heugly@utahslawyers.com', 'super_admin', 'USER_DEACTIVATED', 'USER', '42cac778-c2e8-489d-9582-6bd1640aa4e9', '{\"targetUserCode\":\"USR-004\",\"targetEmail\":\"t.bludworth.1794566658893@utahslawyers.com\",\"previousStatus\":\"Active\",\"newStatus\":\"Inactive\"}', '::1', 'node', '2026-11-13 10:44:19.611'),
('97a37d7f-cbff-4262-a8b5-169db64dcef2', '66c97d44-096b-4d34-8bd1-5691ba855e23', 'Eleanor Heugly, Esq.', 'super_admin', 'USER_LOGIN_SUCCESS', 'AUTH', '66c97d44-096b-4d34-8bd1-5691ba855e23', '{\"email\":\"e.heugly@utahslawyers.com\",\"role\":\"super_admin\",\"rememberMe\":false}', '::1', 'node', '2026-11-13 09:39:28.413'),
('984f697c-325b-4663-afc4-49cfa6f0de3b', '66c97d44-096b-4d34-8bd1-5691ba855e23', 'SYSTEM', 'super_admin', 'INTAKE_CREATED', 'INTAKE', '2b1daaa6-4bbd-4303-bee9-1cd4dbdde1ab', '{\"intakeNumber\":\"INT-26-0001\",\"prospectiveClient\":\"devid\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36', '2026-11-14 09:08:43.002'),
('9ae60e5c-46b7-42de-bbba-f04b27fe95cb', '66c97d44-096b-4d34-8bd1-5691ba855e23', 'e.heugly@utahslawyers.com', 'super_admin', 'CLIENT_CREATED', 'CLIENT', 'd7251bda-8b7d-44ba-9c98-0c2aab623b5f', '{\"clientNumber\":\"CLI-1001\",\"name\":\"fsd\",\"clientType\":\"Organization\",\"status\":\"Active\",\"assignedAttorneyId\":\"af3744b3-df06-4041-bc27-b8d16a8903d7\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36', '2026-11-14 06:33:32.022'),
('9bed1855-8d6a-42e7-b1d8-d332433e3826', '66c97d44-096b-4d34-8bd1-5691ba855e23', 'Eleanor Heugly, Esq.', 'super_admin', 'USER_LOGIN_FAILED', 'AUTH', '66c97d44-096b-4d34-8bd1-5691ba855e23', '{\"email\":\"e.heugly@utahslawyers.com\",\"reason\":\"INVALID_PASSWORD\"}', '::1', 'node', '2026-11-13 09:38:02.546'),
('9ee80a76-2392-49bb-acef-f74ea2bbcd3c', '66c97d44-096b-4d34-8bd1-5691ba855e23', 'Eleanor Heugly, Esq.', 'super_admin', 'USER_LOGIN_SUCCESS', 'AUTH', '66c97d44-096b-4d34-8bd1-5691ba855e23', '{\"email\":\"e.heugly@utahslawyers.com\",\"role\":\"super_admin\",\"rememberMe\":false}', '::1', NULL, '2026-11-14 08:31:41.102'),
('9f63dfa3-b4df-43a6-97ae-cfb1f2a67706', '66c97d44-096b-4d34-8bd1-5691ba855e23', 'e.heugly@utahslawyers.com', 'super_admin', 'USER_ACTIVATED', 'USER', 'af3744b3-df06-4041-bc27-b8d16a8903d7', '{\"targetUserCode\":\"USR-003\",\"targetEmail\":\"t.bludworth.1794562768462@utahslawyers.com\",\"previousStatus\":\"Inactive\",\"newStatus\":\"Active\"}', '::1', 'node', '2026-11-13 09:39:29.415'),
('a0b0e92b-fa2f-4ade-b921-d18f2128d3b8', '66c97d44-096b-4d34-8bd1-5691ba855e23', 'e.heugly@utahslawyers.com', 'super_admin', 'MATTER_PANELS_SAVED', 'MATTER', 'aa405321-481d-4c3c-bd56-ba1fede8e4d7', '{\"matterNumber\":\"26-CIV-0102\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36', '2026-11-18 06:49:28.927'),
('a266857f-9dc2-4d53-9317-ed997526daa2', 'eca5d99f-a1cd-43f8-82f2-830acd1a5ddc', 'David Sterling, Esq.', 'supervisor', 'USER_LOGIN_SUCCESS', 'AUTH', 'eca5d99f-a1cd-43f8-82f2-830acd1a5ddc', '{\"email\":\"d.sterling@utahslawyers.com\",\"role\":\"supervisor\",\"rememberMe\":false}', '::1', 'node', '2026-11-14 07:03:06.035'),
('a7883d9e-3aca-45b1-80b1-5381427bd730', '66c97d44-096b-4d34-8bd1-5691ba855e23', 'Eleanor Heugly, Esq.', 'super_admin', 'USER_LOGIN_SUCCESS', 'AUTH', '66c97d44-096b-4d34-8bd1-5691ba855e23', '{\"email\":\"e.heugly@utahslawyers.com\",\"role\":\"super_admin\",\"rememberMe\":false}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36', '2026-11-14 05:15:36.800'),
('a8943c78-75c5-4d0d-a596-2559cd6c4a56', '66c97d44-096b-4d34-8bd1-5691ba855e23', 'e.heugly@utahslawyers.com', 'super_admin', 'USER_CREATED', 'USER', '27d2ec04-9857-433b-aca6-09cb486c138a', '{\"userCode\":\"USR-004\",\"email\":\"t.bludworth.1794566745371@utahslawyers.com\",\"name\":\"Thomas Bludworth, Esq.\",\"role\":\"attorney\",\"status\":\"Active\"}', '::1', 'node', '2026-11-13 10:45:45.707'),
('a94ec116-daa2-41d4-a99c-fef8bce47fb4', NULL, 'Thomas Bludworth, Esq.', 'attorney', 'USER_LOGIN_BLOCKED', 'AUTH', '7927e70e-a2b7-4a10-933f-24e0e9227c97', '{\"email\":\"t.bludworth.1794566354234@utahslawyers.com\",\"status\":\"Inactive\"}', '::1', 'node', '2026-11-13 10:39:14.967'),
('aa69c346-52b0-4414-9580-d96219f817bb', NULL, 'SYSTEM', 'SYSTEM', 'USER_LOGIN_FAILED', 'AUTH', NULL, '{\"email\":\"e.heugly@utahslawyers.com\",\"reason\":\"USER_NOT_FOUND\"}', '::1', 'node', '2026-11-13 09:08:35.191'),
('ac6fbded-93b7-432c-9054-e99bcc318b94', '66c97d44-096b-4d34-8bd1-5691ba855e23', 'SYSTEM', 'SYSTEM', 'CREATE', 'tasks', 'd48f581c-1564-4a47-8e4c-a165590710c7', '{\"purpose\":\"DOCUMENT_MISSING_INFO_FOLLOWUP\",\"matterId\":\"aa405321-481d-4c3c-bd56-ba1fede8e4d7\",\"taskCode\":\"TSK-26-0002\",\"missingField\":{\"placeholderTag\":\"Insurance.ClaimNumber\",\"sourceEntity\":\"Insurance\",\"sourceField\":\"claimNumber\",\"description\":\"Required field \'Insurance.claimNumber\' is missing or empty in matter records.\"}}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36', '2026-11-17 07:28:30.094'),
('b0753f5f-0feb-4218-817a-97a5641ded73', '66c97d44-096b-4d34-8bd1-5691ba855e23', 'Eleanor Heugly, Esq.', 'super_admin', 'USER_LOGIN_FAILED', 'AUTH', '66c97d44-096b-4d34-8bd1-5691ba855e23', '{\"email\":\"e.heugly@utahslawyers.com\",\"reason\":\"INVALID_PASSWORD\"}', '::1', 'node', '2026-11-13 09:39:27.992'),
('b2996964-71f6-45d8-ac1d-ca87b1f5d7be', NULL, 'SYSTEM', 'SYSTEM', 'USER_LOGIN_FAILED', 'AUTH', NULL, '{\"email\":\"t.bludworth@utahslawyers.com\",\"reason\":\"USER_NOT_FOUND\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36', '2026-11-14 06:58:26.784'),
('b42cd9bf-75e1-4c7a-952c-54fcc0d9f8d0', '66c97d44-096b-4d34-8bd1-5691ba855e23', 'Eleanor Heugly, Esq.', 'super_admin', 'USER_LOGIN_SUCCESS', 'AUTH', '66c97d44-096b-4d34-8bd1-5691ba855e23', '{\"email\":\"e.heugly@utahslawyers.com\",\"role\":\"super_admin\",\"rememberMe\":false}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36', '2026-11-18 09:33:01.543'),
('b582f02f-e156-4b6c-9ec7-d7b8ff0f48d3', '66c97d44-096b-4d34-8bd1-5691ba855e23', 'Eleanor Heugly, Esq.', 'super_admin', 'USER_LOGIN_SUCCESS', 'AUTH', '66c97d44-096b-4d34-8bd1-5691ba855e23', '{\"email\":\"e.heugly@utahslawyers.com\",\"role\":\"super_admin\",\"rememberMe\":false}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36', '2026-11-18 07:21:09.352'),
('b6029df6-b16c-48e3-877d-3e63a4c61d61', '66c97d44-096b-4d34-8bd1-5691ba855e23', 'Eleanor Heugly, Esq.', 'super_admin', 'USER_LOGIN_SUCCESS', 'AUTH', '66c97d44-096b-4d34-8bd1-5691ba855e23', '{\"email\":\"e.heugly@utahslawyers.com\",\"role\":\"super_admin\",\"rememberMe\":false}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36', '2026-11-18 08:42:43.803'),
('b80e1247-7a69-4578-80a1-e19d983e8576', '66c97d44-096b-4d34-8bd1-5691ba855e23', 'SYSTEM', 'super_admin', 'EXPENSE_CREATED', 'BILLING', '9f65113f-9334-4fd2-805a-846ba04d67b8', '{\"expenseCode\":\"EXP-26-0001\",\"amount\":22.93,\"matterNumber\":\"26-CIV-0102\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36', '2026-11-18 08:43:56.206'),
('b9938c0a-27f5-406e-9014-89c97304345e', '66c97d44-096b-4d34-8bd1-5691ba855e23', 'e.heugly@utahslawyers.com', 'super_admin', 'MATTER_PANELS_SAVED', 'MATTER', 'aa405321-481d-4c3c-bd56-ba1fede8e4d7', '{\"matterNumber\":\"26-CIV-0102\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36', '2026-11-18 06:49:17.664'),
('baa2d997-15ed-46be-98f8-5698192acb8b', '66c97d44-096b-4d34-8bd1-5691ba855e23', 'SYSTEM', 'super_admin', 'TASK_CREATED', 'TASK', '24a07424-8588-4fd0-9042-f1eb3e16bb10', '{\"taskCode\":\"TSK-26-0003\",\"title\":\"sddxsd\",\"matterNumber\":\"26-CIV-0102\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36', '2026-11-18 07:21:25.249'),
('bc126957-0d14-4d38-b9b1-29828d3ef8c7', NULL, 'SYSTEM', 'SYSTEM', 'USER_LOGIN_FAILED', 'AUTH', NULL, '{\"email\":\"t.bludworth@utahslawyers.com\",\"reason\":\"USER_NOT_FOUND\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36', '2026-11-14 07:00:22.738'),
('be4b848f-4a3a-440c-bba7-823b00c200a1', 'af3744b3-df06-4041-bc27-b8d16a8903d7', 'Thomas Bludworth, Esq.', 'attorney', 'PASSWORD_RESET_REQUESTED', 'AUTH', 'af3744b3-df06-4041-bc27-b8d16a8903d7', '{\"email\":\"t.bludworth.1794562768462@utahslawyers.com\"}', '::1', 'node', '2026-11-13 09:39:29.434'),
('bfc1a7ce-8d83-4bf8-b624-f040ac119259', 'af3744b3-df06-4041-bc27-b8d16a8903d7', 'Thomas Bludworth, Esq.', 'attorney', 'USER_LOGIN_SUCCESS', 'AUTH', 'af3744b3-df06-4041-bc27-b8d16a8903d7', '{\"email\":\"t.bludworth.1794562768462@utahslawyers.com\",\"role\":\"attorney\",\"rememberMe\":false}', '::1', 'node', '2026-11-13 09:39:30.222'),
('c0cb7fd8-dc65-4e6a-b49d-a649052d8fd1', '66c97d44-096b-4d34-8bd1-5691ba855e23', 'Eleanor Heugly, Esq.', 'super_admin', 'USER_LOGIN_SUCCESS', 'AUTH', '66c97d44-096b-4d34-8bd1-5691ba855e23', '{\"email\":\"e.heugly@utahslawyers.com\",\"role\":\"super_admin\",\"rememberMe\":false}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36', '2026-11-13 13:21:51.254'),
('c3fd5f14-efbb-4592-a7e9-ee8c9fb97b09', '66c97d44-096b-4d34-8bd1-5691ba855e23', 'Eleanor Heugly, Esq.', 'super_admin', 'USER_LOGIN_SUCCESS', 'AUTH', '66c97d44-096b-4d34-8bd1-5691ba855e23', '{\"email\":\"e.heugly@utahslawyers.com\",\"role\":\"super_admin\",\"rememberMe\":false}', '::1', 'node', '2026-11-13 09:38:02.989'),
('c4a94311-3e4c-4143-87e4-4539f180d07d', '66c97d44-096b-4d34-8bd1-5691ba855e23', 'e.heugly@utahslawyers.com', 'super_admin', 'USER_DEACTIVATED', 'USER', '42cac778-c2e8-489d-9582-6bd1640aa4e9', '{\"targetUserCode\":\"USR-004\",\"targetEmail\":\"t.bludworth.1794566658893@utahslawyers.com\",\"previousStatus\":\"Active\",\"newStatus\":\"Inactive\"}', '::1', 'node', '2026-11-13 10:44:20.366'),
('c86abf05-ae73-435c-a5a2-ba87cb123cc5', '66c97d44-096b-4d34-8bd1-5691ba855e23', 'SYSTEM', 'super_admin', 'TASK_CREATED', 'TASK', 'b409329c-3efa-4ff4-ae40-051028509900', '{\"taskCode\":\"TSK-26-0001\",\"title\":\"Follow-up: Missing Adverse Adjuster Details\",\"matterNumber\":\"26-CIV-0102\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36', '2026-11-17 07:28:28.441'),
('c947dc12-37e4-4d6a-94f2-f405bf7663e2', '66c97d44-096b-4d34-8bd1-5691ba855e23', 'e.heugly@utahslawyers.com', 'super_admin', 'USER_DEACTIVATED', 'USER', 'af3744b3-df06-4041-bc27-b8d16a8903d7', '{\"targetUserCode\":\"USR-003\",\"targetEmail\":\"t.bludworth.1794562768462@utahslawyers.com\",\"previousStatus\":\"Active\",\"newStatus\":\"Inactive\"}', '::1', 'node', '2026-11-13 09:39:29.371'),
('cbd087fe-f5e6-46f1-8227-f418f4b0dab0', NULL, 'SYSTEM', 'SYSTEM', 'USER_LOGIN_FAILED', 'AUTH', NULL, '{\"email\":\"t.bludworth@utahslawyers.com\",\"reason\":\"USER_NOT_FOUND\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36', '2026-11-14 07:00:16.597'),
('cd30f6b8-9072-4ab1-8b51-287e6f2a45b7', '66c97d44-096b-4d34-8bd1-5691ba855e23', 'e.heugly@utahslawyers.com', 'super_admin', 'MATTER_PANELS_SAVED', 'MATTER', 'aa405321-481d-4c3c-bd56-ba1fede8e4d7', '{\"matterNumber\":\"26-CIV-0102\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36', '2026-11-18 09:51:15.773'),
('cfd11e99-8f9a-4895-8a7e-5ad588d74b92', '66c97d44-096b-4d34-8bd1-5691ba855e23', 'SYSTEM', 'super_admin', 'TASK_CREATED', 'TASK', '481a0a56-5c81-43d0-8a33-e8a04d3eceec', '{\"taskCode\":\"TSK-26-0006\",\"title\":\"Retain damages/economic expert witness and deliver file\",\"matterNumber\":\"26-CIV-0102\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36', '2026-11-18 09:51:15.787'),
('d0d34a0f-e97e-43b2-b9ff-266e3b5fac28', '66c97d44-096b-4d34-8bd1-5691ba855e23', 'Eleanor Heugly, Esq.', 'super_admin', 'USER_LOGIN_SUCCESS', 'AUTH', '66c97d44-096b-4d34-8bd1-5691ba855e23', '{\"email\":\"e.heugly@utahslawyers.com\",\"role\":\"super_admin\",\"rememberMe\":false}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36', '2026-11-19 05:38:33.527'),
('d23320e1-b67e-451d-84c7-a4d9a343aed0', '66c97d44-096b-4d34-8bd1-5691ba855e23', 'Eleanor Heugly, Esq.', 'super_admin', 'USER_LOGIN_FAILED', 'AUTH', '66c97d44-096b-4d34-8bd1-5691ba855e23', '{\"email\":\"e.heugly@utahslawyers.com\",\"reason\":\"INVALID_PASSWORD\"}', '::1', 'node', '2026-11-13 10:39:13.853'),
('d240a2b8-5323-400f-920f-62466129d4bf', '66c97d44-096b-4d34-8bd1-5691ba855e23', 'SYSTEM', 'super_admin', 'DOCUMENT_DRAFT_GENERATED', 'DOCUMENT_DRAFT', 'c50b4bc5-ca19-48a2-b2f1-dc60672ce515', '{\"draftCode\":\"DFT-26-0001\",\"templateCode\":\"001\",\"matterNumber\":\"26-CIV-0102\",\"isComplete\":true,\"missingFieldsCount\":0}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36', '2026-11-17 07:28:55.070'),
('d2c5aaf0-548e-449b-8d27-bab63efc3feb', '66c97d44-096b-4d34-8bd1-5691ba855e23', 'Eleanor Heugly, Esq.', 'super_admin', 'USER_LOGIN_SUCCESS', 'AUTH', '66c97d44-096b-4d34-8bd1-5691ba855e23', '{\"email\":\"e.heugly@utahslawyers.com\",\"role\":\"super_admin\",\"rememberMe\":false}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36', '2026-11-14 05:48:25.094'),
('d459b00c-cf14-485e-aea8-5739af7219ad', 'af3744b3-df06-4041-bc27-b8d16a8903d7', 'Thomas Bludworth, Esq.', 'attorney', 'USER_LOGIN_SUCCESS', 'AUTH', 'af3744b3-df06-4041-bc27-b8d16a8903d7', '{\"email\":\"t.bludworth.1794562768462@utahslawyers.com\",\"role\":\"attorney\",\"rememberMe\":false}', '::1', 'node', '2026-11-13 09:39:29.319'),
('d4693cc9-c1dc-4d9d-bacc-f24eb05673d2', '66c97d44-096b-4d34-8bd1-5691ba855e23', 'Eleanor Heugly, Esq.', 'super_admin', 'USER_LOGIN_SUCCESS', 'AUTH', '66c97d44-096b-4d34-8bd1-5691ba855e23', '{\"email\":\"e.heugly@utahslawyers.com\",\"role\":\"super_admin\",\"rememberMe\":false}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36', '2026-11-14 06:58:01.968'),
('dac2cc7b-ee71-4b95-885f-d729390a0821', '66c97d44-096b-4d34-8bd1-5691ba855e23', 'SYSTEM', 'super_admin', 'TASK_CREATED', 'TASK', '237503d0-e3a8-4aa2-a5b4-bd032af63ed9', '{\"taskCode\":\"TSK-26-0003\",\"title\":\"wejhd\",\"matterNumber\":\"26-CIV-0102\"}', NULL, NULL, '2026-11-18 07:14:49.365'),
('dc4caf85-2c1e-4f1b-b85b-c9f5974b23d0', '66c97d44-096b-4d34-8bd1-5691ba855e23', 'Eleanor Heugly, Esq.', 'super_admin', 'USER_LOGIN_SUCCESS', 'AUTH', '66c97d44-096b-4d34-8bd1-5691ba855e23', '{\"email\":\"e.heugly@utahslawyers.com\",\"role\":\"super_admin\",\"rememberMe\":false}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36', '2026-11-17 07:45:31.863'),
('dce10a2a-6c36-446a-afe3-e62c016f6a62', '66c97d44-096b-4d34-8bd1-5691ba855e23', 'e.heugly@utahslawyers.com', 'super_admin', 'USER_UPDATED', 'USER', '65a70bdd-33bd-4a4d-9dd8-2dcc5e12b8f9', '{\"changes\":{\"name\":\"shrie\",\"email\":\"s@gmail.com\",\"phone\":\"32323232132\",\"role\":\"attorney\",\"title\":\"Staff Attorney\",\"department\":\"Civil Litigation & Commercial\",\"billingRate\":400,\"rate\":400,\"status\":\"Active\"}}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36', '2026-11-19 05:52:25.250'),
('dde9d7c1-b827-4680-92cf-0b87f48c8f77', '8640f71a-0142-42f4-a4c0-732537dcd9b7', 'Thomas Bludworth, Esq.', 'attorney', 'USER_LOGIN_SUCCESS', 'AUTH', '8640f71a-0142-42f4-a4c0-732537dcd9b7', '{\"email\":\"t.bludworth@utahslawyers.com\",\"role\":\"attorney\",\"rememberMe\":false}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36', '2026-11-19 05:54:07.519');
INSERT INTO `audit_logs` (`id`, `user_id`, `user_name`, `user_role`, `action`, `resource_type`, `resource_id`, `details`, `ip_address`, `user_agent`, `timestamp`) VALUES
('de95bdc8-0ba6-46db-bd15-08ef1ce0de53', '66c97d44-096b-4d34-8bd1-5691ba855e23', 'e.heugly@utahslawyers.com', 'super_admin', 'USER_ACTIVATED', 'USER', '27d2ec04-9857-433b-aca6-09cb486c138a', '{\"targetUserCode\":\"USR-004\",\"targetEmail\":\"t.bludworth.1794566745371@utahslawyers.com\",\"previousStatus\":\"Inactive\",\"newStatus\":\"Active\"}', '::1', 'node', '2026-11-13 10:45:46.196'),
('dff694f9-c8ec-475f-93f1-af5d0a7b258e', '66c97d44-096b-4d34-8bd1-5691ba855e23', 'SYSTEM', 'super_admin', 'DOCUMENT_VERSION_UPLOADED', 'DOCUMENT', '71e3dc71-2720-4813-b3ee-7061615fae5d', '{\"documentCode\":\"DOC-26-0002\",\"versionLabel\":\"v1.0\",\"fileName\":\"ui-flow.pdf\",\"sha256\":\"26df269a364e96fdc072d4728ced32ca656c0b9c4204857086df7ecd933b51c1\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36', '2026-11-17 06:51:54.857'),
('e329ac4a-b725-4342-bf41-e5c73e5f297c', '1a1c1f3c-1a81-47aa-bad3-ec5fd76b9730', 'Thomas Bludworth, Esq.', 'attorney', 'USER_LOGIN_SUCCESS', 'AUTH', '1a1c1f3c-1a81-47aa-bad3-ec5fd76b9730', '{\"email\":\"t.bludworth.1794562683052@utahslawyers.com\",\"role\":\"attorney\",\"rememberMe\":false}', '::1', 'node', '2026-11-13 09:38:05.146'),
('e3a61f4d-7d13-4beb-8222-f87d84754103', '66c97d44-096b-4d34-8bd1-5691ba855e23', 'e.heugly@utahslawyers.com', 'super_admin', 'USER_DEACTIVATED', 'USER', '7927e70e-a2b7-4a10-933f-24e0e9227c97', '{\"targetUserCode\":\"USR-004\",\"targetEmail\":\"t.bludworth.1794566354234@utahslawyers.com\",\"previousStatus\":\"Active\",\"newStatus\":\"Inactive\"}', '::1', 'node', '2026-11-13 10:39:15.712'),
('e8ab2f2e-7e5e-4b0f-8194-6a1bcd4903e4', NULL, 'SYSTEM', 'SYSTEM', 'USER_LOGIN_FAILED', 'AUTH', NULL, '{\"email\":\"m.vance@utahslawyers.com\",\"reason\":\"USER_NOT_FOUND\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36', '2026-11-14 06:58:24.735'),
('e8d1846d-f4f7-453a-add8-3fe1d2a0af52', NULL, 'SYSTEM', 'SYSTEM', 'USER_LOGIN_FAILED', 'AUTH', NULL, '{\"email\":\"d.sterling@utahslawyers.com\",\"reason\":\"USER_NOT_FOUND\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36', '2026-11-14 06:58:25.784'),
('ea22eb75-5569-4969-90a0-c0ba117e900b', '1a1c1f3c-1a81-47aa-bad3-ec5fd76b9730', 'Thomas Bludworth, Esq.', 'attorney', 'PASSWORD_RESET_COMPLETED', 'AUTH', '1a1c1f3c-1a81-47aa-bad3-ec5fd76b9730', '{\"email\":\"t.bludworth.1794562683052@utahslawyers.com\"}', '::1', 'node', '2026-11-13 09:38:04.703'),
('eac65c60-e330-48e8-843a-eeb5a0fe9937', '66c97d44-096b-4d34-8bd1-5691ba855e23', 'Eleanor Heugly, Esq.', 'super_admin', 'USER_LOGIN_SUCCESS', 'AUTH', '66c97d44-096b-4d34-8bd1-5691ba855e23', '{\"email\":\"e.heugly@utahslawyers.com\",\"role\":\"super_admin\",\"rememberMe\":false}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36', '2026-11-14 07:01:25.383'),
('eca7eb03-6274-4a0a-a025-33538806931e', '66c97d44-096b-4d34-8bd1-5691ba855e23', 'Eleanor Heugly, Esq.', 'super_admin', 'USER_LOGIN_SUCCESS', 'AUTH', '66c97d44-096b-4d34-8bd1-5691ba855e23', '{\"email\":\"e.heugly@utahslawyers.com\",\"role\":\"super_admin\",\"rememberMe\":false}', '::1', 'node', '2026-11-13 10:45:45.299'),
('ef60b65a-b3e3-4f88-a9a8-7b05347b343f', '66c97d44-096b-4d34-8bd1-5691ba855e23', 'e.heugly@utahslawyers.com', 'super_admin', 'USER_ACTIVATED', 'USER', '42cac778-c2e8-489d-9582-6bd1640aa4e9', '{\"targetUserCode\":\"USR-004\",\"targetEmail\":\"t.bludworth.1794566658893@utahslawyers.com\",\"previousStatus\":\"Inactive\",\"newStatus\":\"Active\"}', '::1', 'node', '2026-11-13 10:44:19.655'),
('f01c3deb-b0a4-43c1-8a80-179b91098e6c', '66c97d44-096b-4d34-8bd1-5691ba855e23', 'Eleanor Heugly, Esq.', 'super_admin', 'USER_LOGIN_SUCCESS', 'AUTH', '66c97d44-096b-4d34-8bd1-5691ba855e23', '{\"email\":\"e.heugly@utahslawyers.com\",\"role\":\"super_admin\",\"rememberMe\":false}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36', '2026-11-18 06:20:35.658'),
('f0384bb8-ecab-467a-a194-aa85bdb7a1f2', '8640f71a-0142-42f4-a4c0-732537dcd9b7', 'Thomas Bludworth, Esq.', 'attorney', 'USER_LOGIN_SUCCESS', 'AUTH', '8640f71a-0142-42f4-a4c0-732537dcd9b7', '{\"email\":\"t.bludworth@utahslawyers.com\",\"role\":\"attorney\",\"rememberMe\":false}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36', '2026-11-14 08:30:38.370'),
('f12da56a-bf86-464e-826c-83d3a0fb34ea', '66c97d44-096b-4d34-8bd1-5691ba855e23', 'e.heugly@utahslawyers.com', 'super_admin', 'USER_CREATED', 'USER', 'af3744b3-df06-4041-bc27-b8d16a8903d7', '{\"userCode\":\"USR-003\",\"email\":\"t.bludworth.1794562768462@utahslawyers.com\",\"name\":\"Thomas Bludworth, Esq.\",\"role\":\"attorney\",\"status\":\"Active\"}', '::1', 'node', '2026-11-13 09:39:28.875'),
('f3aac23b-9e0e-40e0-8bff-50aed1f9e77a', '66c97d44-096b-4d34-8bd1-5691ba855e23', 'e.heugly@utahslawyers.com', 'super_admin', 'USER_CREATED', 'USER', '65a70bdd-33bd-4a4d-9dd8-2dcc5e12b8f9', '{\"userCode\":\"USR-008\",\"email\":\"s@gmail.com\",\"name\":\"shri\",\"role\":\"attorney\",\"status\":\"Active\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36', '2026-11-18 07:23:36.960'),
('f41b2239-73a8-4aac-9d4b-d5aebf52c072', '66c97d44-096b-4d34-8bd1-5691ba855e23', 'Eleanor Heugly, Esq.', 'super_admin', 'USER_LOGIN_SUCCESS', 'AUTH', '66c97d44-096b-4d34-8bd1-5691ba855e23', '{\"email\":\"e.heugly@utahslawyers.com\",\"role\":\"super_admin\",\"rememberMe\":false}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36', '2026-11-18 07:49:34.722'),
('f4d9dbe3-567a-406c-941b-88efbcd480f2', '66c97d44-096b-4d34-8bd1-5691ba855e23', 'e.heugly@utahslawyers.com', 'super_admin', 'USER_DEACTIVATED', 'USER', '7927e70e-a2b7-4a10-933f-24e0e9227c97', '{\"targetUserCode\":\"USR-004\",\"targetEmail\":\"t.bludworth.1794566354234@utahslawyers.com\",\"previousStatus\":\"Active\",\"newStatus\":\"Inactive\"}', '::1', 'node', '2026-11-13 10:39:14.950'),
('f579991a-7418-4b50-acc4-704b798a7aae', '66c97d44-096b-4d34-8bd1-5691ba855e23', 'SYSTEM', 'super_admin', 'DOCUMENT_CREATED', 'DOCUMENT', '15cea455-bca3-4149-acc2-eeb056baa9d6', '{\"documentCode\":\"DOC-26-0001\",\"title\":\"yuihl\",\"matterNumber\":\"26-CIV-0102\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36', '2026-11-17 06:51:11.035'),
('f665172b-cad0-4010-999e-6a9ee0fb8ac8', '66c97d44-096b-4d34-8bd1-5691ba855e23', 'Eleanor Heugly, Esq.', 'super_admin', 'USER_LOGIN_SUCCESS', 'AUTH', '66c97d44-096b-4d34-8bd1-5691ba855e23', '{\"email\":\"e.heugly@utahslawyers.com\",\"role\":\"super_admin\",\"rememberMe\":false}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36', '2026-11-14 09:28:55.549'),
('f6b35934-6089-43da-9b02-e8110910ed90', NULL, 'SYSTEM', 'SYSTEM', 'USER_LOGIN_FAILED', 'AUTH', NULL, '{\"email\":\"r.adams@utahslawyers.com\",\"reason\":\"USER_NOT_FOUND\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36', '2026-11-14 06:58:33.317'),
('f7a40be2-7065-4da6-ac89-ec415dc16ecf', NULL, 'Thomas Bludworth, Esq.', 'attorney', 'PASSWORD_RESET_REQUESTED', 'AUTH', '7927e70e-a2b7-4a10-933f-24e0e9227c97', '{\"email\":\"t.bludworth.1794566354234@utahslawyers.com\"}', '::1', 'node', '2026-11-13 10:39:15.014'),
('fb4a5048-9fd2-4f52-a3c2-1079a860dc54', NULL, 'Thomas Bludworth, Esq.', 'attorney', 'USER_LOGIN_BLOCKED', 'AUTH', '42cac778-c2e8-489d-9582-6bd1640aa4e9', '{\"email\":\"t.bludworth.1794566658893@utahslawyers.com\",\"status\":\"Inactive\"}', '::1', 'node', '2026-11-13 10:44:19.634'),
('fcd8b56c-000c-414d-8b84-e182dd82c8cd', NULL, 'Thomas Bludworth, Esq.', 'attorney', 'USER_LOGIN_SUCCESS', 'AUTH', '7927e70e-a2b7-4a10-933f-24e0e9227c97', '{\"email\":\"t.bludworth.1794566354234@utahslawyers.com\",\"role\":\"attorney\",\"rememberMe\":false}', '::1', 'node', '2026-11-13 10:39:14.912'),
('fe516fe3-8c61-4c8a-ac00-ea5a73c7adf9', '66c97d44-096b-4d34-8bd1-5691ba855e23', 'Eleanor Heugly, Esq.', 'super_admin', 'USER_LOGIN_SUCCESS', 'AUTH', '66c97d44-096b-4d34-8bd1-5691ba855e23', '{\"email\":\"e.heugly@utahslawyers.com\",\"role\":\"super_admin\",\"rememberMe\":false}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36', '2026-11-14 06:58:28.165'),
('fe5888a7-95d7-4a66-a53d-c2cd4133256a', '66c97d44-096b-4d34-8bd1-5691ba855e23', 'Eleanor Heugly, Esq.', 'super_admin', 'USER_LOGIN_SUCCESS', 'AUTH', '66c97d44-096b-4d34-8bd1-5691ba855e23', '{\"email\":\"e.heugly@utahslawyers.com\",\"role\":\"super_admin\",\"rememberMe\":false}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36', '2026-11-17 06:41:38.536');

-- --------------------------------------------------------

--
-- Table structure for table `bankruptcy_cases`
--

CREATE TABLE `bankruptcy_cases` (
  `id` varchar(36) NOT NULL,
  `matter_id` varchar(36) NOT NULL,
  `chapter` varchar(20) NOT NULL,
  `case_number` varchar(50) DEFAULT NULL,
  `court_district` varchar(150) DEFAULT 'District of Utah',
  `court_division` varchar(100) DEFAULT 'Salt Lake City',
  `assigned_judge` varchar(150) DEFAULT NULL,
  `trustee_name` varchar(150) DEFAULT NULL,
  `debtor_type` varchar(50) NOT NULL DEFAULT 'Individual',
  `filing_date` date DEFAULT NULL,
  `meeting_341_date` datetime(3) DEFAULT NULL,
  `confirmation_date` date DEFAULT NULL,
  `discharge_date` date DEFAULT NULL,
  `status` varchar(50) NOT NULL DEFAULT 'Pre-Filing',
  `household_size` int(11) DEFAULT 1,
  `monthly_gross_income` decimal(12,2) DEFAULT NULL,
  `means_test_status` varchar(100) DEFAULT NULL,
  `total_secured_debt` decimal(12,2) DEFAULT 0.00,
  `total_unsecured_debt` decimal(12,2) DEFAULT 0.00,
  `total_priority_debt` decimal(12,2) DEFAULT 0.00,
  `total_assets` decimal(12,2) DEFAULT 0.00,
  `notes` text DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `bankruptcy_creditors`
--

CREATE TABLE `bankruptcy_creditors` (
  `id` varchar(36) NOT NULL,
  `bankruptcy_case_id` varchar(36) NOT NULL,
  `creditor_name` varchar(200) NOT NULL,
  `claim_type` varchar(50) NOT NULL,
  `account_number` varchar(100) DEFAULT NULL,
  `claim_amount` decimal(12,2) NOT NULL,
  `collateral_description` varchar(255) DEFAULT NULL,
  `collateral_value` decimal(12,2) DEFAULT NULL,
  `address` varchar(255) DEFAULT NULL,
  `city` varchar(100) DEFAULT NULL,
  `state` varchar(10) DEFAULT NULL,
  `zip` varchar(20) DEFAULT NULL,
  `is_notice_only` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `bankruptcy_schedules`
--

CREATE TABLE `bankruptcy_schedules` (
  `id` varchar(36) NOT NULL,
  `bankruptcy_case_id` varchar(36) NOT NULL,
  `schedule_code` varchar(10) NOT NULL,
  `description` text NOT NULL,
  `value_amount` decimal(12,2) NOT NULL,
  `exempt_amount` decimal(12,2) DEFAULT 0.00,
  `statutory_exemption_law` varchar(150) DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `calendar_events`
--

CREATE TABLE `calendar_events` (
  `id` varchar(36) NOT NULL,
  `matter_id` varchar(36) DEFAULT NULL,
  `title` varchar(255) NOT NULL,
  `event_type` varchar(50) NOT NULL,
  `start_time` datetime(3) NOT NULL,
  `end_time` datetime(3) NOT NULL,
  `location` varchar(255) DEFAULT NULL,
  `judge` varchar(150) DEFAULT NULL,
  `is_court_appearance` tinyint(1) NOT NULL DEFAULT 0,
  `created_by_user_id` varchar(36) NOT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `calendar_events`
--

INSERT INTO `calendar_events` (`id`, `matter_id`, `title`, `event_type`, `start_time`, `end_time`, `location`, `judge`, `is_court_appearance`, `created_by_user_id`, `created_at`) VALUES
('a42304b7-7446-4cd6-9a6e-829e94df7c0a', 'aa405321-481d-4c3c-bd56-ba1fede8e4d7', 'aZX', 'Hearing', '2026-11-20 03:30:00.000', '2026-11-20 04:30:00.000', 'Third Judicial District Court, Courtroom 3B', 'Hon. Carolyn B. McHugh', 1, '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-18 07:25:21.384');

-- --------------------------------------------------------

--
-- Table structure for table `chart_of_accounts`
--

CREATE TABLE `chart_of_accounts` (
  `account_number` int(11) NOT NULL,
  `account_name` varchar(100) NOT NULL,
  `account_type` varchar(50) NOT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1
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
  `id` varchar(36) NOT NULL,
  `client_number` varchar(50) NOT NULL,
  `name` varchar(255) NOT NULL,
  `client_type` varchar(50) NOT NULL,
  `primary_contact` varchar(255) DEFAULT NULL,
  `email` varchar(255) NOT NULL,
  `phone` varchar(50) NOT NULL,
  `address` text DEFAULT NULL,
  `assigned_attorney_id` varchar(36) DEFAULT NULL,
  `status` varchar(20) NOT NULL DEFAULT 'Active',
  `notes` text DEFAULT NULL,
  `portal_access_enabled` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `clients`
--

INSERT INTO `clients` (`id`, `client_number`, `name`, `client_type`, `primary_contact`, `email`, `phone`, `address`, `assigned_attorney_id`, `status`, `notes`, `portal_access_enabled`, `created_at`, `updated_at`) VALUES
('d7251bda-8b7d-44ba-9c98-0c2aab623b5f', 'CLI-1001', 'fsd', 'Organization', 'ssfs', 'ygbh@gmail.com', '948615189194', 'sfdfs', 'af3744b3-df06-4041-bc27-b8d16a8903d7', 'Active', 'sfsf', 0, '2026-11-14 06:33:32.015', '2026-11-14 06:33:32.015');

-- --------------------------------------------------------

--
-- Table structure for table `communications`
--

CREATE TABLE `communications` (
  `id` varchar(36) NOT NULL,
  `client_id` varchar(36) DEFAULT NULL,
  `matter_id` varchar(36) DEFAULT NULL,
  `type` varchar(50) NOT NULL,
  `subject` varchar(255) NOT NULL,
  `sender` varchar(255) NOT NULL,
  `recipient` varchar(255) NOT NULL,
  `summary` text NOT NULL,
  `direction` varchar(20) NOT NULL DEFAULT 'OUTBOUND',
  `date` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `duration_minutes` int(11) DEFAULT NULL,
  `status` varchar(50) NOT NULL DEFAULT 'Filed',
  `source_identifier` varchar(255) DEFAULT NULL,
  `created_by_id` varchar(36) DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `communications`
--

INSERT INTO `communications` (`id`, `client_id`, `matter_id`, `type`, `subject`, `sender`, `recipient`, `summary`, `direction`, `date`, `duration_minutes`, `status`, `source_identifier`, `created_by_id`, `created_at`, `updated_at`) VALUES
('2732e172-1ddf-41ae-bcd1-44ce5ccf5d53', 'd7251bda-8b7d-44ba-9c98-0c2aab623b5f', 'aa405321-481d-4c3c-bd56-ba1fede8e4d7', 'Email', 'Test Correspondence from verification script', 'Thomas Bludworth, Esq.', 'ygbh@gmail.com', 'Conference notes saved directly to legal-db', 'OUTBOUND', '2026-11-17 07:46:09.515', NULL, 'Filed', NULL, '1a1c1f3c-1a81-47aa-bad3-ec5fd76b9730', '2026-11-17 07:46:09.519', '2026-11-17 07:46:09.519');

-- --------------------------------------------------------

--
-- Table structure for table `conflict_search_logs`
--

CREATE TABLE `conflict_search_logs` (
  `id` varchar(36) NOT NULL,
  `intake_id` varchar(36) NOT NULL,
  `queried_name` varchar(255) NOT NULL,
  `matched_entity_type` varchar(50) NOT NULL,
  `matched_record_id` varchar(100) NOT NULL,
  `searched_by_user_id` varchar(36) NOT NULL,
  `searched_at` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `court_hearings`
--

CREATE TABLE `court_hearings` (
  `id` varchar(36) NOT NULL,
  `litigation_case_id` varchar(36) NOT NULL,
  `hearing_type` varchar(100) NOT NULL,
  `hearing_date` datetime(3) NOT NULL,
  `courtroom` varchar(100) DEFAULT NULL,
  `judge_name` varchar(150) DEFAULT NULL,
  `status` varchar(50) NOT NULL DEFAULT 'Scheduled',
  `notes` text DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `criminal_cases`
--

CREATE TABLE `criminal_cases` (
  `id` varchar(36) NOT NULL,
  `matter_id` varchar(36) NOT NULL,
  `defendant_name` varchar(200) NOT NULL,
  `court_jurisdiction` varchar(150) DEFAULT NULL,
  `case_docket_number` varchar(100) DEFAULT NULL,
  `presiding_judge` varchar(150) DEFAULT NULL,
  `prosecuting_agency` varchar(150) DEFAULT NULL,
  `bail_amount` decimal(12,2) DEFAULT 0.00,
  `custody_status` varchar(50) NOT NULL DEFAULT 'Released on Bail',
  `arraignment_date` datetime(3) DEFAULT NULL,
  `preliminary_hearing_date` datetime(3) DEFAULT NULL,
  `trial_date` datetime(3) DEFAULT NULL,
  `status` varchar(50) NOT NULL DEFAULT 'Arraignment Scheduled',
  `notes` text DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `criminal_charges`
--

CREATE TABLE `criminal_charges` (
  `id` varchar(36) NOT NULL,
  `criminal_case_id` varchar(36) NOT NULL,
  `count_number` int(11) NOT NULL,
  `statute_code` varchar(100) NOT NULL,
  `charge_title` varchar(255) NOT NULL,
  `severity_class` varchar(50) NOT NULL,
  `plea` varchar(50) DEFAULT 'Not Guilty',
  `disposition` varchar(100) DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `discovery_requests`
--

CREATE TABLE `discovery_requests` (
  `id` varchar(36) NOT NULL,
  `litigation_case_id` varchar(36) NOT NULL,
  `title` varchar(255) NOT NULL,
  `category` varchar(50) NOT NULL,
  `propounding_party` varchar(150) NOT NULL,
  `responding_party` varchar(150) NOT NULL,
  `served_date` date DEFAULT NULL,
  `due_date` date NOT NULL,
  `status` varchar(50) NOT NULL DEFAULT 'Pending',
  `completed_date` date DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `documents`
--

CREATE TABLE `documents` (
  `id` varchar(36) NOT NULL,
  `document_code` varchar(50) NOT NULL,
  `matter_id` varchar(36) NOT NULL,
  `client_id` varchar(36) NOT NULL,
  `title` varchar(255) NOT NULL,
  `category` varchar(50) NOT NULL,
  `current_version` varchar(20) NOT NULL DEFAULT 'v1.0',
  `is_privileged` tinyint(1) NOT NULL DEFAULT 0,
  `privilege_type` varchar(100) DEFAULT NULL,
  `ocr_content` longtext DEFAULT NULL,
  `bates_number_start` varchar(50) DEFAULT NULL,
  `bates_number_end` varchar(50) DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `documents`
--

INSERT INTO `documents` (`id`, `document_code`, `matter_id`, `client_id`, `title`, `category`, `current_version`, `is_privileged`, `privilege_type`, `ocr_content`, `bates_number_start`, `bates_number_end`, `created_at`, `updated_at`) VALUES
('15cea455-bca3-4149-acc2-eeb056baa9d6', 'DOC-26-0001', 'aa405321-481d-4c3c-bd56-ba1fede8e4d7', 'd7251bda-8b7d-44ba-9c98-0c2aab623b5f', 'yuihl', 'Motion', 'v1.0', 1, 'Attorney Work Product (Utah RPC 1.6)', NULL, NULL, NULL, '2026-11-17 06:51:11.014', '2026-11-17 06:51:11.353'),
('71e3dc71-2720-4813-b3ee-7061615fae5d', 'DOC-26-0002', 'aa405321-481d-4c3c-bd56-ba1fede8e4d7', 'd7251bda-8b7d-44ba-9c98-0c2aab623b5f', '4ed', 'Motion', 'v1.0', 1, 'Attorney Work Product (Utah RPC 1.6)', NULL, NULL, NULL, '2026-11-17 06:51:54.621', '2026-11-17 06:51:54.849'),
('a07b0759-426b-43e4-802d-08be2c30b698', 'DOC-26-0003', 'd9de7ced-2cd9-43e4-82c7-935865345c4e', 'd7251bda-8b7d-44ba-9c98-0c2aab623b5f', 'fewewf', 'Discovery', 'v1.0', 1, 'Attorney Work Product (Utah RPC 1.6)', NULL, NULL, NULL, '2026-11-17 07:12:17.377', '2026-11-17 07:12:17.587');

-- --------------------------------------------------------

--
-- Table structure for table `document_drafts`
--

CREATE TABLE `document_drafts` (
  `id` varchar(36) NOT NULL,
  `draft_code` varchar(50) NOT NULL,
  `matter_id` varchar(36) NOT NULL,
  `client_id` varchar(36) NOT NULL,
  `template_id` varchar(36) NOT NULL,
  `template_version_id` varchar(36) NOT NULL,
  `title` varchar(255) NOT NULL,
  `status` varchar(30) NOT NULL DEFAULT 'Draft',
  `docx_storage_key` varchar(500) DEFAULT NULL,
  `pdf_storage_key` varchar(500) DEFAULT NULL,
  `missing_fields_flags` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`missing_fields_flags`)),
  `generated_by_user_id` varchar(36) NOT NULL,
  `reviewed_by_user_id` varchar(36) DEFAULT NULL,
  `reviewed_at` datetime(3) DEFAULT NULL,
  `has_manual_edits` tinyint(1) NOT NULL DEFAULT 0,
  `is_stale` tinyint(1) NOT NULL DEFAULT 0,
  `final_document_id` varchar(36) DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `document_drafts`
--

INSERT INTO `document_drafts` (`id`, `draft_code`, `matter_id`, `client_id`, `template_id`, `template_version_id`, `title`, `status`, `docx_storage_key`, `pdf_storage_key`, `missing_fields_flags`, `generated_by_user_id`, `reviewed_by_user_id`, `reviewed_at`, `has_manual_edits`, `is_stale`, `final_document_id`, `created_at`, `updated_at`) VALUES
('c50b4bc5-ca19-48a2-b2f1-dc60672ce515', 'DFT-26-0001', 'aa405321-481d-4c3c-bd56-ba1fede8e4d7', 'd7251bda-8b7d-44ba-9c98-0c2aab623b5f', '3c17a6da-2357-4ec6-a8d8-13c5f33aa42a', 'f9c9377f-38da-4bec-834e-ff7250569b6e', 'Master Client Engagement & Retainer Agreement (Template 001) - tester', 'Draft', 'drafts/aa405321-481d-4c3c-bd56-ba1fede8e4d7/DFT-26-0001.docx', NULL, '[]', '66c97d44-096b-4d34-8bd1-5691ba855e23', NULL, NULL, 0, 0, NULL, '2026-11-17 07:28:55.053', '2026-11-17 07:28:55.053');

-- --------------------------------------------------------

--
-- Table structure for table `document_field_mappings`
--

CREATE TABLE `document_field_mappings` (
  `id` varchar(36) NOT NULL,
  `template_version_id` varchar(36) NOT NULL,
  `placeholder_tag` varchar(150) NOT NULL,
  `source_entity` varchar(50) NOT NULL,
  `source_field` varchar(100) NOT NULL,
  `is_required` tinyint(1) NOT NULL DEFAULT 1,
  `default_value` varchar(255) DEFAULT NULL,
  `formatting_rule` varchar(50) DEFAULT NULL,
  `conditional_expression` varchar(255) DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `document_field_mappings`
--

INSERT INTO `document_field_mappings` (`id`, `template_version_id`, `placeholder_tag`, `source_entity`, `source_field`, `is_required`, `default_value`, `formatting_rule`, `conditional_expression`, `created_at`, `updated_at`) VALUES
('15bef2e9-e3ef-4ff5-ac73-fc40a3b1045b', '22c41738-34a9-488c-981c-e25a4a0f4436', 'Matter.MatterNumber', 'Matter', 'matterNumber', 1, NULL, 'NONE', NULL, '2026-11-14 07:59:55.067', '2026-11-14 07:59:55.067'),
('304470af-f0b3-40d1-9709-3cff8fbf1e90', '8e72cc61-fc2f-4a0c-9e4d-537e7c782b93', 'Client.Address', 'Client', 'address', 0, NULL, 'NONE', NULL, '2026-11-14 07:59:55.058', '2026-11-14 07:59:55.058'),
('36327e02-b6d1-4d43-87a7-725de8e98be2', 'b24ab83e-1174-466a-a9e4-41b61aee38ec', 'Insurance.ClaimNumber', 'Insurance', 'claimNumber', 1, NULL, 'NONE', NULL, '2026-11-14 07:59:55.031', '2026-11-14 07:59:55.031'),
('3aacf8c4-1e28-4fe4-aa3e-a1a8029ae39d', '8e72cc61-fc2f-4a0c-9e4d-537e7c782b93', 'Client.Phone', 'Client', 'phone', 0, NULL, 'NONE', NULL, '2026-11-14 07:59:55.058', '2026-11-14 07:59:55.058'),
('49744f59-e5f3-4812-afcc-406a1604fc8b', '22c41738-34a9-488c-981c-e25a4a0f4436', 'Attorney.Name', 'Attorney', 'name', 1, NULL, 'NONE', NULL, '2026-11-14 07:59:55.067', '2026-11-14 07:59:55.067'),
('4b4edf30-75d3-4f5e-b7d4-80613ae84093', 'f9c9377f-38da-4bec-834e-ff7250569b6e', 'Matter.MatterNumber', 'Matter', 'matterNumber', 1, NULL, 'NONE', NULL, '2026-11-14 07:59:55.075', '2026-11-14 07:59:55.075'),
('5622c652-1f6b-4bde-843f-d64ff6a52ead', 'f9c9377f-38da-4bec-834e-ff7250569b6e', 'Attorney.Name', 'Attorney', 'name', 1, NULL, 'NONE', NULL, '2026-11-14 07:59:55.075', '2026-11-14 07:59:55.075'),
('6292da64-7335-4665-9d64-ceb9a6dbf0d2', 'b24ab83e-1174-466a-a9e4-41b61aee38ec', 'Matter.MatterNumber', 'Matter', 'matterNumber', 1, NULL, 'NONE', NULL, '2026-11-14 07:59:55.031', '2026-11-14 07:59:55.031'),
('6c0a456c-c20c-43ae-a93c-855fe0846be0', '1c26eebe-22ee-4a21-9ae0-088e1e6b481b', 'MedicalProvider.Address', 'MedicalProvider', 'address', 1, NULL, 'NONE', NULL, '2026-11-14 07:59:55.045', '2026-11-14 07:59:55.045'),
('6f0c7f43-a392-42aa-8c58-a36cfcfd71a3', 'b24ab83e-1174-466a-a9e4-41b61aee38ec', 'Attorney.Name', 'Attorney', 'name', 1, NULL, 'NONE', NULL, '2026-11-14 07:59:55.031', '2026-11-14 07:59:55.031'),
('70177d1c-5d05-4675-8993-fd200c96a7cd', '1c26eebe-22ee-4a21-9ae0-088e1e6b481b', 'Attorney.Name', 'Attorney', 'name', 1, NULL, 'NONE', NULL, '2026-11-14 07:59:55.045', '2026-11-14 07:59:55.045'),
('839fd4cf-b352-401e-8465-299439366722', '1c26eebe-22ee-4a21-9ae0-088e1e6b481b', 'MedicalProvider.Name', 'MedicalProvider', 'name', 1, NULL, 'NONE', NULL, '2026-11-14 07:59:55.045', '2026-11-14 07:59:55.045'),
('8680ffc0-1e31-4500-afd0-b92b36b8a745', '1c26eebe-22ee-4a21-9ae0-088e1e6b481b', 'Client.Name', 'Client', 'name', 1, NULL, 'NONE', NULL, '2026-11-14 07:59:55.045', '2026-11-14 07:59:55.045'),
('926691cc-c610-45c6-827b-84cfd4c98722', '8e72cc61-fc2f-4a0c-9e4d-537e7c782b93', 'Matter.MatterNumber', 'Matter', 'matterNumber', 1, NULL, 'NONE', NULL, '2026-11-14 07:59:55.058', '2026-11-14 07:59:55.058'),
('97c87dca-9145-4d2d-9dfa-9be354689ea7', 'b24ab83e-1174-466a-a9e4-41b61aee38ec', 'Client.Name', 'Client', 'name', 1, NULL, 'NONE', NULL, '2026-11-14 07:59:55.031', '2026-11-14 07:59:55.031'),
('99ae933d-3be0-47e9-906c-5d8b878ada9b', '22c41738-34a9-488c-981c-e25a4a0f4436', 'Client.Name', 'Client', 'name', 1, NULL, 'NONE', NULL, '2026-11-14 07:59:55.067', '2026-11-14 07:59:55.067'),
('9c879009-edcc-40ab-b0e6-731c1cd217b2', 'f9c9377f-38da-4bec-834e-ff7250569b6e', 'Matter.Title', 'Matter', 'title', 1, NULL, 'NONE', NULL, '2026-11-14 07:59:55.075', '2026-11-14 07:59:55.075'),
('a9843dc2-c8a4-4d3e-9e7f-98a8ff8d69ba', 'b24ab83e-1174-466a-a9e4-41b61aee38ec', 'Matter.Title', 'Matter', 'title', 1, NULL, 'NONE', NULL, '2026-11-14 07:59:55.031', '2026-11-14 07:59:55.031'),
('beb3ebde-169f-40f8-b9e3-57d75f2ca02a', 'b24ab83e-1174-466a-a9e4-41b61aee38ec', 'Insurance.CarrierName', 'Insurance', 'carrierName', 0, NULL, 'NONE', NULL, '2026-11-14 07:59:55.031', '2026-11-14 07:59:55.031'),
('d33ac63f-3c37-4d89-9fce-1e4593a85189', '8e72cc61-fc2f-4a0c-9e4d-537e7c782b93', 'Client.Name', 'Client', 'name', 1, NULL, 'NONE', NULL, '2026-11-14 07:59:55.058', '2026-11-14 07:59:55.058'),
('e0b2a509-db77-41f9-8dad-ecb986809e4d', '22c41738-34a9-488c-981c-e25a4a0f4436', 'MedicalProvider.Name', 'MedicalProvider', 'name', 1, NULL, 'NONE', NULL, '2026-11-14 07:59:55.067', '2026-11-14 07:59:55.067'),
('e224074b-c673-4152-a81c-17034ecb74b8', 'f9c9377f-38da-4bec-834e-ff7250569b6e', 'Client.Name', 'Client', 'name', 1, NULL, 'NONE', NULL, '2026-11-14 07:59:55.075', '2026-11-14 07:59:55.075'),
('e94f32b1-d070-4cfc-9bbc-cf413d33a0d0', 'b24ab83e-1174-466a-a9e4-41b61aee38ec', 'Insurance.AdjusterName', 'Insurance', 'adjusterName', 1, NULL, 'NONE', NULL, '2026-11-14 07:59:55.031', '2026-11-14 07:59:55.031'),
('fff92607-6fc8-44bd-83ba-deba889df9da', '1c26eebe-22ee-4a21-9ae0-088e1e6b481b', 'Matter.MatterNumber', 'Matter', 'matterNumber', 1, NULL, 'NONE', NULL, '2026-11-14 07:59:55.045', '2026-11-14 07:59:55.045');

-- --------------------------------------------------------

--
-- Table structure for table `document_templates`
--

CREATE TABLE `document_templates` (
  `id` varchar(36) NOT NULL,
  `template_code` varchar(50) NOT NULL,
  `template_name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `practice_area_id` varchar(50) NOT NULL,
  `category` varchar(100) NOT NULL,
  `output_format` varchar(20) NOT NULL DEFAULT 'DOCX',
  `current_version` varchar(20) NOT NULL DEFAULT 'v1.0',
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `is_system_default` tinyint(1) NOT NULL DEFAULT 0,
  `created_by_user_id` varchar(36) NOT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `document_templates`
--

INSERT INTO `document_templates` (`id`, `template_code`, `template_name`, `description`, `practice_area_id`, `category`, `output_format`, `current_version`, `is_active`, `is_system_default`, `created_by_user_id`, `created_at`, `updated_at`) VALUES
('3c17a6da-2357-4ec6-a8d8-13c5f33aa42a', '001', 'Master Client Engagement & Retainer Agreement (Template 001)', 'Standard attorney representation agreement and legal retainer agreement under Utah RPC 1.5 & 1.15.', 'pa-fam', 'Engagement', 'DOCX', 'v1.0', 1, 1, '1a1c1f3c-1a81-47aa-bad3-ec5fd76b9730', '2026-11-14 07:59:55.075', '2026-11-14 07:59:55.075'),
('427035e4-0a8a-4d8a-a58b-9d7806966e60', '113', 'Medical Records & Billing Request (Template 113)', 'Formal request for certified medical records, itemized billing statements, and treatment notes.', 'pa-pi', 'Medical', 'DOCX', 'v1.0', 1, 1, '1a1c1f3c-1a81-47aa-bad3-ec5fd76b9730', '2026-11-14 07:59:55.045', '2026-11-14 07:59:55.045'),
('6d2012bd-67cf-45e3-94b4-6ded0ee3739e', '115', 'Medical Records Deficiency Notice (Template 115)', 'Notice identifying missing, incomplete, or uncertified medical records from a provider.', 'pa-pi', 'Notices', 'DOCX', 'v1.0', 1, 1, '1a1c1f3c-1a81-47aa-bad3-ec5fd76b9730', '2026-11-14 07:59:55.067', '2026-11-14 07:59:55.067'),
('993555ae-ee1f-43df-961e-197632f6a2e6', '112', 'HIPAA Medical Information Authorization (Template 112)', 'HIPAA and Utah state law-compliant authorization for release of protected health information.', 'pa-pi', 'Authorizations', 'DOCX', 'v1.0', 1, 1, '1a1c1f3c-1a81-47aa-bad3-ec5fd76b9730', '2026-11-14 07:59:55.058', '2026-11-14 07:59:55.058'),
('c0ea16b1-101e-49e0-86e2-578414f2f95a', '096', 'Representation Letter - Liability Carrier (Template 096)', 'Formal representation notice transmitted to liability insurance carrier on behalf of injured client.', 'pa-pi', 'Correspondence', 'DOCX', 'v1.0', 1, 1, '1a1c1f3c-1a81-47aa-bad3-ec5fd76b9730', '2026-11-14 07:59:55.031', '2026-11-14 07:59:55.031');

-- --------------------------------------------------------

--
-- Table structure for table `document_versions`
--

CREATE TABLE `document_versions` (
  `id` varchar(36) NOT NULL,
  `document_id` varchar(36) NOT NULL,
  `version_label` varchar(20) NOT NULL,
  `file_name` varchar(255) NOT NULL,
  `file_type` varchar(50) NOT NULL,
  `file_size_bytes` bigint(20) NOT NULL,
  `s3_storage_key` varchar(500) NOT NULL,
  `sha256_checksum` varchar(64) NOT NULL,
  `uploaded_by_user_id` varchar(36) NOT NULL,
  `revision_notes` text DEFAULT NULL,
  `uploaded_at` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `document_versions`
--

INSERT INTO `document_versions` (`id`, `document_id`, `version_label`, `file_name`, `file_type`, `file_size_bytes`, `s3_storage_key`, `sha256_checksum`, `uploaded_by_user_id`, `revision_notes`, `uploaded_at`) VALUES
('155680ec-de72-46b2-875a-398731b2a2ab', 'a07b0759-426b-43e4-802d-08be2c30b698', 'v1.0', 'ui-flow.pdf', 'application/pdf', 1859914, 'vault/d9de7ced-2cd9-43e4-82c7-935865345c4e/DOC-26-0003/v1.0_ui-flow.pdf', '26df269a364e96fdc072d4728ced32ca656c0b9c4204857086df7ecd933b51c1', '66c97d44-096b-4d34-8bd1-5691ba855e23', 'Initial document filing in firm vault.', '2026-11-17 07:12:17.566'),
('84efadec-660f-4d6c-a1a4-be62d2820d32', '71e3dc71-2720-4813-b3ee-7061615fae5d', 'v1.0', 'ui-flow.pdf', 'application/pdf', 1859914, 'vault/aa405321-481d-4c3c-bd56-ba1fede8e4d7/DOC-26-0002/v1.0_ui-flow.pdf', '26df269a364e96fdc072d4728ced32ca656c0b9c4204857086df7ecd933b51c1', '66c97d44-096b-4d34-8bd1-5691ba855e23', 'Initial document filing in firm vault.', '2026-11-17 06:51:54.839'),
('f862c4d1-8e2f-4ff5-8cc5-2b8019ed226c', '15cea455-bca3-4149-acc2-eeb056baa9d6', 'v1.0', 'Iridescent Neon Glass Orb-2.png', 'application/pdf', 1659786, 'vault/aa405321-481d-4c3c-bd56-ba1fede8e4d7/DOC-26-0001/v1.0_Iridescent Neon Glass Orb-2.png', 'e2e552d064e626bbf08b89b43576622d0edb951f772a68a63757e94bb28ed538', '66c97d44-096b-4d34-8bd1-5691ba855e23', 'Initial document filing in firm vault.', '2026-11-17 06:51:11.343');

-- --------------------------------------------------------

--
-- Table structure for table `evictions_cases`
--

CREATE TABLE `evictions_cases` (
  `id` varchar(36) NOT NULL,
  `matter_id` varchar(36) NOT NULL,
  `property_address` varchar(255) NOT NULL,
  `unit_number` varchar(50) DEFAULT NULL,
  `tenant_name` varchar(200) NOT NULL,
  `landlord_name` varchar(200) NOT NULL,
  `lease_start_date` date DEFAULT NULL,
  `monthly_rent` decimal(10,2) NOT NULL,
  `outstanding_balance` decimal(10,2) NOT NULL DEFAULT 0.00,
  `notice_type` varchar(100) DEFAULT NULL,
  `notice_served_date` date DEFAULT NULL,
  `summons_issued_date` date DEFAULT NULL,
  `occupancy_hearing_date` datetime(3) DEFAULT NULL,
  `writ_of_restitution_date` date DEFAULT NULL,
  `status` varchar(50) NOT NULL DEFAULT 'Notice Phase',
  `notes` text DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `expenses`
--

CREATE TABLE `expenses` (
  `id` varchar(36) NOT NULL,
  `expense_code` varchar(50) NOT NULL,
  `matter_id` varchar(36) NOT NULL,
  `incurred_by_user_id` varchar(36) NOT NULL,
  `date` date NOT NULL,
  `category` varchar(100) NOT NULL,
  `amount` decimal(12,2) NOT NULL,
  `vendor_name` varchar(255) DEFAULT NULL,
  `receipt_document_id` varchar(36) DEFAULT NULL,
  `is_billable` tinyint(1) NOT NULL DEFAULT 1,
  `status` varchar(30) NOT NULL DEFAULT 'Unbilled',
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `expenses`
--

INSERT INTO `expenses` (`id`, `expense_code`, `matter_id`, `incurred_by_user_id`, `date`, `category`, `amount`, `vendor_name`, `receipt_document_id`, `is_billable`, `status`, `created_at`) VALUES
('9f65113f-9334-4fd2-805a-846ba04d67b8', 'EXP-26-0001', 'aa405321-481d-4c3c-bd56-ba1fede8e4d7', '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-18', 'Court Filing Fees', 22.93, 'wdqsaasd', NULL, 1, 'Unbilled', '2026-11-18 08:43:56.196');

-- --------------------------------------------------------

--
-- Table structure for table `family_law_cases`
--

CREATE TABLE `family_law_cases` (
  `id` varchar(36) NOT NULL,
  `matter_id` varchar(36) NOT NULL,
  `case_type` varchar(100) NOT NULL,
  `court_docket_number` varchar(100) DEFAULT NULL,
  `marriage_date` date DEFAULT NULL,
  `separation_date` date DEFAULT NULL,
  `has_minor_children` tinyint(1) NOT NULL DEFAULT 0,
  `custody_arrangement` varchar(150) DEFAULT NULL,
  `monthly_child_support` decimal(10,2) DEFAULT 0.00,
  `monthly_alimony` decimal(10,2) DEFAULT 0.00,
  `status` varchar(50) NOT NULL DEFAULT 'Filing Pending',
  `mediation_date` datetime(3) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `family_law_orders`
--

CREATE TABLE `family_law_orders` (
  `id` varchar(36) NOT NULL,
  `family_law_case_id` varchar(36) NOT NULL,
  `order_title` varchar(200) NOT NULL,
  `order_type` varchar(100) NOT NULL,
  `entry_date` date DEFAULT NULL,
  `effective_date` date DEFAULT NULL,
  `signed_by_judge` varchar(150) DEFAULT NULL,
  `status` varchar(50) NOT NULL DEFAULT 'Active',
  `summary_terms` text DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `general_ledger_entries`
--

CREATE TABLE `general_ledger_entries` (
  `id` varchar(36) NOT NULL,
  `journal_id` varchar(36) NOT NULL,
  `account_number` int(11) NOT NULL,
  `debit` decimal(12,2) NOT NULL DEFAULT 0.00,
  `credit` decimal(12,2) NOT NULL DEFAULT 0.00,
  `matter_id` varchar(36) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `general_ledger_journals`
--

CREATE TABLE `general_ledger_journals` (
  `id` varchar(36) NOT NULL,
  `journal_number` varchar(50) NOT NULL,
  `transaction_date` date NOT NULL,
  `memo` text NOT NULL,
  `created_by_user_id` varchar(36) NOT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `immigration_cases`
--

CREATE TABLE `immigration_cases` (
  `id` varchar(36) NOT NULL,
  `matter_id` varchar(36) NOT NULL,
  `visa_category` varchar(100) DEFAULT NULL,
  `alien_registration_num` varchar(50) DEFAULT NULL,
  `uscis_online_account_num` varchar(50) DEFAULT NULL,
  `beneficiary_name` varchar(200) DEFAULT NULL,
  `beneficiary_dob` date DEFAULT NULL,
  `country_of_citizenship` varchar(100) DEFAULT NULL,
  `country_of_birth` varchar(100) DEFAULT NULL,
  `current_immigration_status` varchar(100) DEFAULT NULL,
  `class_of_admission` varchar(50) DEFAULT NULL,
  `i94_number` varchar(50) DEFAULT NULL,
  `priority_date` date DEFAULT NULL,
  `status` varchar(50) NOT NULL DEFAULT 'Preparation',
  `notes` text DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `immigration_parties`
--

CREATE TABLE `immigration_parties` (
  `id` varchar(36) NOT NULL,
  `immigration_case_id` varchar(36) NOT NULL,
  `name` varchar(200) NOT NULL,
  `relationship_role` varchar(100) NOT NULL,
  `citizenship` varchar(100) DEFAULT NULL,
  `phone` varchar(50) DEFAULT NULL,
  `email` varchar(150) DEFAULT NULL,
  `address` varchar(255) DEFAULT NULL,
  `is_signer` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `intakes`
--

CREATE TABLE `intakes` (
  `id` varchar(36) NOT NULL,
  `intake_number` varchar(50) NOT NULL,
  `prospective_client` varchar(255) NOT NULL,
  `contact_person` varchar(255) DEFAULT NULL,
  `email` varchar(255) NOT NULL,
  `phone` varchar(50) NOT NULL,
  `practice_area_id` varchar(50) DEFAULT NULL,
  `adverse_parties` text NOT NULL,
  `matter_summary` text NOT NULL,
  `dispute_amount` decimal(12,2) DEFAULT 0.00,
  `jurisdiction_venue` varchar(255) DEFAULT NULL,
  `conflict_status` varchar(50) NOT NULL DEFAULT 'Not Started',
  `reviewed_by_user_id` varchar(36) DEFAULT NULL,
  `reviewed_at` datetime(3) DEFAULT NULL,
  `conflict_notes` text DEFAULT NULL,
  `converted_to_client` tinyint(1) NOT NULL DEFAULT 0,
  `converted_client_id` varchar(36) DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL,
  `converted_matter_id` varchar(36) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `intakes`
--

INSERT INTO `intakes` (`id`, `intake_number`, `prospective_client`, `contact_person`, `email`, `phone`, `practice_area_id`, `adverse_parties`, `matter_summary`, `dispute_amount`, `jurisdiction_venue`, `conflict_status`, `reviewed_by_user_id`, `reviewed_at`, `conflict_notes`, `converted_to_client`, `converted_client_id`, `created_at`, `updated_at`, `converted_matter_id`) VALUES
('2b1daaa6-4bbd-4303-bee9-1cd4dbdde1ab', 'INT-26-0001', 'devid', 'sfdgfdsg', 'devid11@gmail.com', '2344565632', 'pa-civ', 'werwr', 'dfdsfs', 75000.00, 'Utah Third Judicial District Court (Salt Lake County)', 'Cleared', NULL, NULL, NULL, 0, NULL, '2026-11-14 09:08:42.981', '2026-11-14 09:08:42.996', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `invoices`
--

CREATE TABLE `invoices` (
  `id` varchar(36) NOT NULL,
  `invoice_number` varchar(50) NOT NULL,
  `client_id` varchar(36) NOT NULL,
  `matter_id` varchar(36) NOT NULL,
  `issue_date` date NOT NULL,
  `due_date` date NOT NULL,
  `total_amount` decimal(12,2) NOT NULL,
  `paid_amount` decimal(12,2) NOT NULL DEFAULT 0.00,
  `balance_due` decimal(12,2) NOT NULL,
  `status` varchar(30) NOT NULL DEFAULT 'Draft',
  `sent_at` datetime(3) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `invoices`
--

INSERT INTO `invoices` (`id`, `invoice_number`, `client_id`, `matter_id`, `issue_date`, `due_date`, `total_amount`, `paid_amount`, `balance_due`, `status`, `sent_at`, `notes`, `created_at`, `updated_at`) VALUES
('c07f704a-378d-4de1-968f-c242b4b4cde1', 'INV-26-0001', 'd7251bda-8b7d-44ba-9c98-0c2aab623b5f', 'aa405321-481d-4c3c-bd56-ba1fede8e4d7', '2026-11-18', '2026-12-18', 4850.00, 0.00, 4850.00, 'Draft', NULL, 'Professional legal services rendered pursuant to legal representation agreement.', '2026-11-18 07:51:44.332', '2026-11-18 07:51:44.332');

-- --------------------------------------------------------

--
-- Table structure for table `invoice_line_items`
--

CREATE TABLE `invoice_line_items` (
  `id` varchar(36) NOT NULL,
  `invoice_id` varchar(36) NOT NULL,
  `item_type` varchar(20) NOT NULL,
  `time_entry_id` varchar(36) DEFAULT NULL,
  `expense_id` varchar(36) DEFAULT NULL,
  `description` text NOT NULL,
  `quantity` decimal(5,2) NOT NULL,
  `unit_rate` decimal(10,2) NOT NULL,
  `total_price` decimal(12,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `invoice_line_items`
--

INSERT INTO `invoice_line_items` (`id`, `invoice_id`, `item_type`, `time_entry_id`, `expense_id`, `description`, `quantity`, `unit_rate`, `total_price`) VALUES
('89e39c00-8a6e-43dd-bb31-55bfcf3c448c', 'c07f704a-378d-4de1-968f-c242b4b4cde1', 'Time', NULL, NULL, 'Legal counsel, pleadings drafting, anzd court filings', 10.00, 450.00, 4500.00),
('94dd82f2-2a32-4958-944c-fe9b35da7d45', 'c07f704a-378d-4de1-968f-c242b4b4cde1', 'Expense', NULL, NULL, 'Court filing fees & service of process statutory costs', 1.00, 350.00, 350.00);

-- --------------------------------------------------------

--
-- Table structure for table `litigation_cases`
--

CREATE TABLE `litigation_cases` (
  `id` varchar(36) NOT NULL,
  `matter_id` varchar(36) NOT NULL,
  `court_jurisdiction` varchar(150) DEFAULT NULL,
  `court_name` varchar(255) DEFAULT NULL,
  `case_docket_number` varchar(100) DEFAULT NULL,
  `presiding_judge` varchar(150) DEFAULT NULL,
  `jury_demand` tinyint(1) NOT NULL DEFAULT 0,
  `litigation_stage` varchar(50) NOT NULL DEFAULT 'Pre-Filing',
  `filing_date` date DEFAULT NULL,
  `trial_date` date DEFAULT NULL,
  `discovery_cutoff_date` date DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `matters`
--

CREATE TABLE `matters` (
  `id` varchar(36) NOT NULL,
  `matter_number` varchar(50) NOT NULL,
  `client_id` varchar(36) NOT NULL,
  `title` varchar(255) NOT NULL,
  `practice_area_id` varchar(50) NOT NULL,
  `current_stage_id` varchar(50) DEFAULT NULL,
  `status` varchar(50) NOT NULL DEFAULT 'Active',
  `responsible_attorney_id` varchar(36) NOT NULL,
  `billing_type` varchar(50) NOT NULL,
  `hourly_rate` decimal(10,2) DEFAULT NULL,
  `flat_fee_amount` decimal(12,2) DEFAULT NULL,
  `contingency_percentage` decimal(5,2) DEFAULT NULL,
  `budget` decimal(12,2) NOT NULL DEFAULT 0.00,
  `open_date` date NOT NULL,
  `close_date` date DEFAULT NULL,
  `statute_of_limitations` date DEFAULT NULL,
  `next_court_date` datetime(3) DEFAULT NULL,
  `court_name` varchar(255) DEFAULT NULL,
  `judge` varchar(150) DEFAULT NULL,
  `case_docket_number` varchar(100) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `matters`
--

INSERT INTO `matters` (`id`, `matter_number`, `client_id`, `title`, `practice_area_id`, `current_stage_id`, `status`, `responsible_attorney_id`, `billing_type`, `hourly_rate`, `flat_fee_amount`, `contingency_percentage`, `budget`, `open_date`, `close_date`, `statute_of_limitations`, `next_court_date`, `court_name`, `judge`, `case_docket_number`, `description`, `created_at`, `updated_at`) VALUES
('aa405321-481d-4c3c-bd56-ba1fede8e4d7', '26-CIV-0102', 'd7251bda-8b7d-44ba-9c98-0c2aab623b5f', 'tester', 'pa-civ', NULL, 'Active', '8640f71a-0142-42f4-a4c0-732537dcd9b7', 'Hourly', 2.00, NULL, NULL, 2.00, '2026-11-17', NULL, '2026-11-18', '2026-11-17 00:00:00.000', '2', '2', NULL, 'wq', '2026-11-17 06:49:20.876', '2026-11-18 09:51:15.750'),
('d9de7ced-2cd9-43e4-82c7-935865345c4e', '26-CIV-0101', 'd7251bda-8b7d-44ba-9c98-0c2aab623b5f', 'demo', 'pa-civ', NULL, 'Active', 'af3744b3-df06-4041-bc27-b8d16a8903d7', 'Hourly', 500.00, NULL, NULL, 50000.00, '2026-11-14', NULL, NULL, NULL, 'Utah Third Judicial District Court - Salt Lake City', 'Hon. Elizabeth A. Hruby-Mills', NULL, '[ETHICAL_WALL:ENABLED:Excluded=Paralegal Staff]\ndsdbdub', '2026-11-14 06:39:54.262', '2026-11-14 06:39:54.262');

-- --------------------------------------------------------

--
-- Table structure for table `matter_overview_panels`
--

CREATE TABLE `matter_overview_panels` (
  `id` varchar(36) NOT NULL,
  `matter_id` varchar(36) NOT NULL,
  `panels_data` longtext NOT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL DEFAULT current_timestamp(3) ON UPDATE current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `matter_overview_panels`
--

INSERT INTO `matter_overview_panels` (`id`, `matter_id`, `panels_data`, `created_at`, `updated_at`) VALUES
('dd302727-89a7-479a-804f-5a09049d22b6', 'aa405321-481d-4c3c-bd56-ba1fede8e4d7', '{\"nextActions\":[{\"id\":\"aa405321-481d-4c3c-bd56-ba1fede8e4d7-na-1\",\"title\":\"Serve Supplemental Initial Disclosures (26-CIV-0102)\",\"description\":\"Compile updated damages ledger, custodian list, and exhibits for fsd under Utah R. Civ. P. 26.\",\"assignedUser\":\"Thomas Bludworth, Esq.\",\"priority\":\"High\",\"dueDate\":\"2026-11-18\",\"status\":\"Completed\"},{\"id\":\"aa405321-481d-4c3c-bd56-ba1fede8e4d7-na-2\",\"title\":\"Confirm Witness Availability for Deposition Schedule\",\"description\":\"Coordinate date windows with opposing counsel and court reporter before Rule 16 discovery cutoff.\",\"assignedUser\":\"Marcus Vance\",\"priority\":\"Urgent\",\"dueDate\":\"2026-11-15\",\"status\":\"Pending\"},{\"id\":\"aa405321-481d-4c3c-bd56-ba1fede8e4d7-na-3\",\"title\":\"Verify Conflict Screening & Engagement Retainer Ledger\",\"description\":\"Audit trust balance coverage ahead of scheduled pre-trial conference and expert retention.\",\"assignedUser\":\"Marcus Vance\",\"priority\":\"Medium\",\"dueDate\":\"2026-11-10\",\"status\":\"Completed\"}],\"missingInfoItems\":[{\"id\":\"aa405321-481d-4c3c-bd56-ba1fede8e4d7-mi-1\",\"fieldOrDocument\":\"Executed Custodian Preservation Acknowledgment\",\"reasonRequired\":\"Required to establish litigation-hold chain of custody before ESI production.\",\"requestedFrom\":\"fsd (General Counsel)\",\"requestDate\":\"2026-11-01\",\"status\":\"Received\",\"followUpDate\":\"2026-11-18\"},{\"id\":\"aa405321-481d-4c3c-bd56-ba1fede8e4d7-mi-2\",\"fieldOrDocument\":\"2024–2025 Audited Financial & Tax Schedules\",\"reasonRequired\":\"Needed by forensic damages expert to verify lost-profits baseline calculations.\",\"requestedFrom\":\"fsd (CPA / Accounting)\",\"requestDate\":\"2026-10-26\",\"status\":\"Follow-up Sent\",\"followUpDate\":\"2026-11-14\"},{\"id\":\"aa405321-481d-4c3c-bd56-ba1fede8e4d7-mi-3\",\"fieldOrDocument\":\"Certified Policy Declarations & Endorsements\",\"reasonRequired\":\"Confirm applicable liability and excess umbrella coverage limits.\",\"requestedFrom\":\"Opposing Insurance Carrier / Broker\",\"requestDate\":\"2026-10-18\",\"status\":\"Received\",\"followUpDate\":\"2026-10-29\"}],\"unresolvedRequests\":[{\"id\":\"aa405321-481d-4c3c-bd56-ba1fede8e4d7-ur-1\",\"title\":\"Third-Party Subpoena Compliance Return (Records Custodian)\",\"category\":\"Third-Party Evidence\",\"requestedFrom\":\"Intermountain Telemetry Corp.\",\"requestDate\":\"2026-10-15\",\"dueDate\":\"2026-11-05\",\"status\":\"Overdue\",\"followUpNote\":\"First deficiency reminder sent Nov 6; escalate to subpoena meet-and-confer.\"},{\"id\":\"aa405321-481d-4c3c-bd56-ba1fede8e4d7-ur-2\",\"title\":\"Stipulated Protective Order Signature Page\",\"category\":\"Opposing Counsel Coordination\",\"requestedFrom\":\"Opposing Counsel (R. Sterling, Esq.)\",\"requestDate\":\"2026-11-03\",\"dueDate\":\"2026-11-19\",\"status\":\"Pending\",\"followUpNote\":\"Awaiting redline sign-off prior to e-filing.\"},{\"id\":\"aa405321-481d-4c3c-bd56-ba1fede8e4d7-ur-3\",\"title\":\"Certified Court Hearing Audio & Minute Entry\",\"category\":\"Court Clerk Request\",\"requestedFrom\":\"2\",\"requestDate\":\"2026-10-20\",\"dueDate\":\"2026-11-02\",\"status\":\"Received\",\"followUpNote\":\"Transcript audio received; awaiting final verification.\"},{\"id\":\"aa405321-481d-4c3c-bd56-ba1fede8e4d7-ur-4\",\"title\":\"Signed Engagement Fee Addendum & Retainer Top-Up\",\"category\":\"Client Administration\",\"requestedFrom\":\"fsd\",\"requestDate\":\"2026-10-10\",\"dueDate\":\"2026-10-22\",\"status\":\"Resolved\",\"followUpNote\":\"Executed addendum archived and retainer posted.\"}],\"approvalItems\":[{\"id\":\"aa405321-481d-4c3c-bd56-ba1fede8e4d7-ap-1\",\"itemName\":\"Draft First Amended Pleading & Exhibit Index (26-CIV-0102)\",\"itemType\":\"Court Pleading Draft\",\"submittedBy\":\"Marcus Vance\",\"submissionDate\":\"2026-11-10\",\"assignedAttorney\":\"Thomas Bludworth, Esq.\",\"status\":\"Awaiting Review\",\"summary\":\"Updated factual allegations and attached Exhibits A–D for attorney review before filing.\",\"reviewNotes\":\"\"},{\"id\":\"aa405321-481d-4c3c-bd56-ba1fede8e4d7-ap-2\",\"itemName\":\"Written Discovery Objections & Privilege Log Draft\",\"itemType\":\"Discovery Response\",\"submittedBy\":\"Sarah Jenkins, Esq.\",\"submissionDate\":\"2026-11-09\",\"assignedAttorney\":\"Thomas Bludworth, Esq.\",\"status\":\"In Review\",\"summary\":\"Contains 14 privilege log entries under Utah RPC 1.6 and Rule 26(b)(5) requiring lead counsel clearance.\",\"reviewNotes\":\"Confirm Bates range BATES-0412 to BATES-0438 redaction scope.\"},{\"id\":\"aa405321-481d-4c3c-bd56-ba1fede8e4d7-ap-3\",\"itemName\":\"Pre-Filing Settlement Demand & Damages Schedule\",\"itemType\":\"Demand / Settlement Letter\",\"submittedBy\":\"Marcus Vance\",\"submissionDate\":\"2026-11-06\",\"assignedAttorney\":\"Thomas Bludworth, Esq.\",\"status\":\"Changes Requested\",\"summary\":\"Draft demand package including economic loss tables and statutory fee breakdown.\",\"reviewNotes\":\"Update pre-judgment interest calculation through November 15 before final approval.\"}],\"currentStage\":\"Expert Discovery\"}', '2026-11-18 06:49:17.649', '2026-11-18 09:51:15.753');

-- --------------------------------------------------------

--
-- Table structure for table `matter_staff_assignments`
--

CREATE TABLE `matter_staff_assignments` (
  `id` varchar(36) NOT NULL,
  `matter_id` varchar(36) NOT NULL,
  `user_id` varchar(36) NOT NULL,
  `assignment_role` varchar(50) NOT NULL,
  `assigned_at` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `matter_staff_assignments`
--

INSERT INTO `matter_staff_assignments` (`id`, `matter_id`, `user_id`, `assignment_role`, `assigned_at`) VALUES
('e921ccac-71a2-4960-8722-6816cf0f62ac', 'aa405321-481d-4c3c-bd56-ba1fede8e4d7', 'b4144e13-e1b8-4c10-bc62-3ca0966380e0', 'paralegal', '2026-11-17 06:49:20.882');

-- --------------------------------------------------------

--
-- Table structure for table `matter_stage_histories`
--

CREATE TABLE `matter_stage_histories` (
  `id` varchar(36) NOT NULL,
  `matter_id` varchar(36) NOT NULL,
  `from_stage_id` varchar(50) DEFAULT NULL,
  `to_stage_id` varchar(50) NOT NULL,
  `transitioned_by_user_id` varchar(36) NOT NULL,
  `verified_gatekeepers` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`verified_gatekeepers`)),
  `transitioned_at` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `payment_records`
--

CREATE TABLE `payment_records` (
  `id` varchar(36) NOT NULL,
  `payment_reference` varchar(50) NOT NULL,
  `invoice_id` varchar(36) NOT NULL,
  `client_id` varchar(36) NOT NULL,
  `amount` decimal(12,2) NOT NULL,
  `payment_method` varchar(50) NOT NULL,
  `destination_account` varchar(50) NOT NULL,
  `transaction_reference` varchar(100) DEFAULT NULL,
  `received_date` date NOT NULL,
  `recorded_by_user_id` varchar(36) NOT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `pi_damages_records`
--

CREATE TABLE `pi_damages_records` (
  `id` varchar(36) NOT NULL,
  `matter_id` varchar(36) NOT NULL,
  `injury_category` varchar(50) NOT NULL,
  `anatomical_location` varchar(150) NOT NULL,
  `severity_grade` varchar(50) NOT NULL,
  `icd_code` varchar(30) DEFAULT NULL,
  `future_treatment_projected` tinyint(1) NOT NULL DEFAULT 0,
  `future_medical_estimated_cost` decimal(12,2) NOT NULL DEFAULT 0.00,
  `treatment_summary` text DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `pi_demand_packages`
--

CREATE TABLE `pi_demand_packages` (
  `id` varchar(36) NOT NULL,
  `matter_id` varchar(36) NOT NULL,
  `insurance_policy_id` varchar(36) DEFAULT NULL,
  `draft_document_id` varchar(36) DEFAULT NULL,
  `approved_by_attorney_id` varchar(36) DEFAULT NULL,
  `demand_title` varchar(255) NOT NULL,
  `recipient_carrier` varchar(200) NOT NULL,
  `claim_number` varchar(100) DEFAULT NULL,
  `demanded_amount` decimal(12,2) NOT NULL,
  `policy_limit_amount` decimal(12,2) DEFAULT NULL,
  `is_policy_limit_demand` tinyint(1) NOT NULL DEFAULT 0,
  `status` varchar(50) NOT NULL DEFAULT 'DRAFTING',
  `sent_date` date DEFAULT NULL,
  `deadline_date` date NOT NULL,
  `response_received_date` date DEFAULT NULL,
  `checklist_state` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`checklist_state`)),
  `counter_offer_amount` decimal(12,2) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `pi_diagnostic_studies`
--

CREATE TABLE `pi_diagnostic_studies` (
  `id` varchar(36) NOT NULL,
  `matter_id` varchar(36) NOT NULL,
  `damages_record_id` varchar(36) DEFAULT NULL,
  `imaging_report_document_id` varchar(36) DEFAULT NULL,
  `study_type` varchar(50) NOT NULL,
  `body_region` varchar(100) NOT NULL,
  `study_date` date NOT NULL,
  `facility_name` varchar(200) NOT NULL,
  `radiologist_impression` text NOT NULL,
  `is_positive_finding` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `pi_incidents`
--

CREATE TABLE `pi_incidents` (
  `id` varchar(36) NOT NULL,
  `matter_id` varchar(36) NOT NULL,
  `incident_date` date DEFAULT NULL,
  `incident_time` varchar(20) DEFAULT NULL,
  `incident_location` varchar(255) DEFAULT NULL,
  `accident_type` varchar(100) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `police_agency` varchar(150) DEFAULT NULL,
  `report_number` varchar(100) DEFAULT NULL,
  `investigating_officer` varchar(150) DEFAULT NULL,
  `liability_assessment` varchar(50) DEFAULT NULL,
  `plaintiff_fault_percentage` decimal(5,2) DEFAULT NULL,
  `adverse_fault_percentage` decimal(5,2) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `pi_incident_parties`
--

CREATE TABLE `pi_incident_parties` (
  `id` varchar(36) NOT NULL,
  `incident_id` varchar(36) NOT NULL,
  `party_type` varchar(50) NOT NULL,
  `full_name` varchar(150) NOT NULL,
  `phone` varchar(50) DEFAULT NULL,
  `insurance_carrier` varchar(150) DEFAULT NULL,
  `policy_number` varchar(100) DEFAULT NULL,
  `claim_number` varchar(100) DEFAULT NULL,
  `vehicle_make` varchar(50) DEFAULT NULL,
  `vehicle_model` varchar(50) DEFAULT NULL,
  `vehicle_year` int(11) DEFAULT NULL,
  `vehicle_plate` varchar(20) DEFAULT NULL,
  `vehicle_state` varchar(10) DEFAULT NULL,
  `citations_issued` varchar(255) DEFAULT NULL,
  `admitted_fault` tinyint(1) NOT NULL DEFAULT 0,
  `fault_percentage` decimal(5,2) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `pi_insurance_policies`
--

CREATE TABLE `pi_insurance_policies` (
  `id` varchar(36) NOT NULL,
  `matter_id` varchar(36) NOT NULL,
  `incident_id` varchar(36) DEFAULT NULL,
  `coverage_type` varchar(50) NOT NULL,
  `insurance_company` varchar(200) NOT NULL,
  `policy_number` varchar(100) DEFAULT NULL,
  `claim_number` varchar(100) DEFAULT NULL,
  `adjuster_name` varchar(150) DEFAULT NULL,
  `adjuster_phone` varchar(50) DEFAULT NULL,
  `adjuster_email` varchar(150) DEFAULT NULL,
  `adjuster_fax` varchar(50) DEFAULT NULL,
  `insured_name` varchar(150) DEFAULT NULL,
  `policy_limits` varchar(100) DEFAULT NULL,
  `status` varchar(30) NOT NULL DEFAULT 'Active',
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `pi_liens`
--

CREATE TABLE `pi_liens` (
  `id` varchar(36) NOT NULL,
  `matter_id` varchar(36) NOT NULL,
  `provider_id` varchar(36) DEFAULT NULL,
  `lienholder_name` varchar(200) NOT NULL,
  `category` varchar(50) NOT NULL,
  `account_reference` varchar(100) DEFAULT NULL,
  `asserted_amount` decimal(12,2) NOT NULL,
  `verified_amount` decimal(12,2) NOT NULL DEFAULT 0.00,
  `negotiated_amount` decimal(12,2) NOT NULL DEFAULT 0.00,
  `common_fund_reduction_rate` decimal(5,2) DEFAULT NULL,
  `procurement_cost_deduction` decimal(12,2) NOT NULL DEFAULT 0.00,
  `final_payoff_amount` decimal(12,2) NOT NULL DEFAULT 0.00,
  `status` varchar(50) NOT NULL DEFAULT 'ASSERTED',
  `final_payoff_letter_document_id` varchar(36) DEFAULT NULL,
  `is_erisa_qualified` tinyint(1) NOT NULL DEFAULT 0,
  `notes` text DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `pi_lien_negotiations`
--

CREATE TABLE `pi_lien_negotiations` (
  `id` varchar(36) NOT NULL,
  `lien_id` varchar(36) NOT NULL,
  `conducted_by_user_id` varchar(36) NOT NULL,
  `negotiation_date` date NOT NULL,
  `offered_amount` decimal(12,2) NOT NULL,
  `response_amount` decimal(12,2) DEFAULT NULL,
  `outcome` varchar(50) NOT NULL,
  `notes` text DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `pi_medical_billing_summaries`
--

CREATE TABLE `pi_medical_billing_summaries` (
  `id` varchar(36) NOT NULL,
  `matter_id` varchar(36) NOT NULL,
  `provider_id` varchar(36) NOT NULL,
  `account_number` varchar(100) NOT NULL DEFAULT 'PRIMARY',
  `service_category` varchar(150) DEFAULT NULL,
  `total_billed` decimal(12,2) NOT NULL DEFAULT 0.00,
  `cached_balance_owed` decimal(12,2) NOT NULL DEFAULT 0.00,
  `billing_ledger_document_id` varchar(36) DEFAULT NULL,
  `treatment_status` varchar(50) NOT NULL DEFAULT 'ACTIVE',
  `notes` text DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `pi_medical_payment_records`
--

CREATE TABLE `pi_medical_payment_records` (
  `id` varchar(36) NOT NULL,
  `billing_summary_id` varchar(36) NOT NULL,
  `transaction_type` varchar(50) NOT NULL,
  `payment_source` varchar(50) NOT NULL,
  `amount` decimal(12,2) NOT NULL,
  `payment_date` date NOT NULL,
  `check_or_reference_number` varchar(50) DEFAULT NULL,
  `eob_document_id` varchar(36) DEFAULT NULL,
  `reversal_of_record_id` varchar(36) DEFAULT NULL,
  `reason_notes` text DEFAULT NULL,
  `created_by_user_id` varchar(36) NOT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `pi_medical_providers`
--

CREATE TABLE `pi_medical_providers` (
  `id` varchar(36) NOT NULL,
  `matter_id` varchar(36) NOT NULL,
  `provider_name` varchar(200) NOT NULL,
  `provider_type` varchar(100) DEFAULT NULL,
  `facility_address` varchar(255) DEFAULT NULL,
  `phone` varchar(50) DEFAULT NULL,
  `fax` varchar(50) DEFAULT NULL,
  `email` varchar(150) DEFAULT NULL,
  `treatment_start_date` date DEFAULT NULL,
  `treatment_end_date` date DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `pi_medical_record_requests`
--

CREATE TABLE `pi_medical_record_requests` (
  `id` varchar(36) NOT NULL,
  `matter_id` varchar(36) NOT NULL,
  `provider_id` varchar(36) NOT NULL,
  `request_code` varchar(50) NOT NULL,
  `status` varchar(50) NOT NULL DEFAULT 'Drafted',
  `authorization_signed` tinyint(1) NOT NULL DEFAULT 0,
  `authorization_date` date DEFAULT NULL,
  `authorization_document_id` varchar(36) DEFAULT NULL,
  `request_document_id` varchar(36) DEFAULT NULL,
  `request_sent_date` date DEFAULT NULL,
  `request_due_date` date DEFAULT NULL,
  `records_received_date` date DEFAULT NULL,
  `is_complete` tinyint(1) NOT NULL DEFAULT 0,
  `deficiency_notes` text DEFAULT NULL,
  `follow_up_document_id` varchar(36) DEFAULT NULL,
  `follow_up_sent_date` date DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `pi_settlement_disbursements`
--

CREATE TABLE `pi_settlement_disbursements` (
  `id` varchar(36) NOT NULL,
  `matter_id` varchar(36) NOT NULL,
  `settlement_title` varchar(255) NOT NULL,
  `current_version_number` int(11) NOT NULL DEFAULT 1,
  `status` varchar(50) NOT NULL DEFAULT 'DRAFT',
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `pi_settlement_disbursement_versions`
--

CREATE TABLE `pi_settlement_disbursement_versions` (
  `id` varchar(36) NOT NULL,
  `settlement_disbursement_id` varchar(36) NOT NULL,
  `version_number` int(11) NOT NULL,
  `gross_settlement_amount` decimal(12,2) NOT NULL,
  `contingency_fee_percentage` decimal(5,2) NOT NULL,
  `calculated_attorney_fee` decimal(12,2) NOT NULL,
  `total_litigation_costs` decimal(12,2) NOT NULL,
  `total_client_advances` decimal(12,2) NOT NULL DEFAULT 0.00,
  `total_medical_liens` decimal(12,2) NOT NULL,
  `other_deductions` decimal(12,2) NOT NULL DEFAULT 0.00,
  `net_client_recovery` decimal(12,2) NOT NULL,
  `version_status` varchar(50) NOT NULL DEFAULT 'DRAFT',
  `is_immutable` tinyint(1) NOT NULL DEFAULT 0,
  `signed_closing_statement_doc_id` varchar(36) DEFAULT NULL,
  `client_approval_date` date DEFAULT NULL,
  `client_approval_evidence` varchar(255) DEFAULT NULL,
  `approved_by_attorney_id` varchar(36) DEFAULT NULL,
  `approved_at` datetime(3) DEFAULT NULL,
  `created_by_user_id` varchar(36) NOT NULL,
  `notes` text DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `pi_settlement_executions`
--

CREATE TABLE `pi_settlement_executions` (
  `id` varchar(36) NOT NULL,
  `settlement_version_id` varchar(36) NOT NULL,
  `trust_sub_ledger_id` varchar(36) NOT NULL,
  `idempotency_key` varchar(100) NOT NULL,
  `executed_by_user_id` varchar(36) NOT NULL,
  `executed_at` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `pi_settlement_execution_lines`
--

CREATE TABLE `pi_settlement_execution_lines` (
  `id` varchar(36) NOT NULL,
  `settlement_execution_id` varchar(36) NOT NULL,
  `trust_sub_ledger_id` varchar(36) NOT NULL,
  `trust_transaction_id` varchar(36) NOT NULL,
  `disbursement_role` varchar(50) NOT NULL,
  `line_identifier` varchar(100) NOT NULL,
  `lien_id` varchar(36) DEFAULT NULL,
  `amount` decimal(12,2) NOT NULL,
  `payee_name` varchar(200) DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `pi_vendors`
--

CREATE TABLE `pi_vendors` (
  `id` varchar(36) NOT NULL,
  `vendor_name` varchar(200) NOT NULL,
  `category` varchar(100) NOT NULL,
  `contact_person` varchar(150) DEFAULT NULL,
  `phone` varchar(50) DEFAULT NULL,
  `email` varchar(150) DEFAULT NULL,
  `hourly_rate` decimal(10,2) DEFAULT NULL,
  `tax_id` varchar(50) DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `pi_vendor_assignments`
--

CREATE TABLE `pi_vendor_assignments` (
  `id` varchar(36) NOT NULL,
  `matter_id` varchar(36) NOT NULL,
  `vendor_id` varchar(36) NOT NULL,
  `assigned_staff_id` varchar(36) NOT NULL,
  `expense_id` varchar(36) DEFAULT NULL,
  `service_scope` text NOT NULL,
  `status` varchar(50) NOT NULL DEFAULT 'ASSIGNED',
  `assigned_date` date NOT NULL,
  `due_date` date DEFAULT NULL,
  `authorized_amount` decimal(12,2) NOT NULL DEFAULT 0.00,
  `invoiced_amount` decimal(12,2) NOT NULL DEFAULT 0.00,
  `report_document_id` varchar(36) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `pi_wage_loss_records`
--

CREATE TABLE `pi_wage_loss_records` (
  `id` varchar(36) NOT NULL,
  `matter_id` varchar(36) NOT NULL,
  `verification_document_id` varchar(36) DEFAULT NULL,
  `employer_name` varchar(200) NOT NULL,
  `job_title` varchar(150) NOT NULL,
  `pay_rate_type` varchar(50) NOT NULL DEFAULT 'HOURLY',
  `base_pay_rate` decimal(10,2) NOT NULL,
  `hours_lost` decimal(8,2) DEFAULT NULL,
  `days_lost` int(11) DEFAULT NULL,
  `start_date` date NOT NULL,
  `end_date` date DEFAULT NULL,
  `total_lost_wages` decimal(12,2) NOT NULL,
  `is_verified_by_employer` tinyint(1) NOT NULL DEFAULT 0,
  `notes` text DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `pleadings_records`
--

CREATE TABLE `pleadings_records` (
  `id` varchar(36) NOT NULL,
  `litigation_case_id` varchar(36) NOT NULL,
  `title` varchar(255) NOT NULL,
  `pleading_type` varchar(100) NOT NULL,
  `filing_party` varchar(150) NOT NULL,
  `filed_date` date DEFAULT NULL,
  `response_due_date` date DEFAULT NULL,
  `status` varchar(50) NOT NULL DEFAULT 'Draft',
  `ecf_docket_number` varchar(50) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `practice_areas`
--

CREATE TABLE `practice_areas` (
  `id` varchar(50) NOT NULL,
  `name` varchar(150) NOT NULL,
  `code` varchar(10) NOT NULL,
  `brand_color` varchar(20) NOT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1
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
  `id` varchar(36) NOT NULL,
  `probate_case_id` varchar(36) NOT NULL,
  `asset_type` varchar(100) NOT NULL,
  `description` text NOT NULL,
  `estimated_value` decimal(12,2) NOT NULL,
  `appraisal_value` decimal(12,2) DEFAULT NULL,
  `is_disposed` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `probate_beneficiaries`
--

CREATE TABLE `probate_beneficiaries` (
  `id` varchar(36) NOT NULL,
  `probate_case_id` varchar(36) NOT NULL,
  `name` varchar(200) NOT NULL,
  `relationship` varchar(100) NOT NULL,
  `share_percent` decimal(5,2) DEFAULT NULL,
  `specific_gift` text DEFAULT NULL,
  `is_notice_sent` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `probate_cases`
--

CREATE TABLE `probate_cases` (
  `id` varchar(36) NOT NULL,
  `matter_id` varchar(36) NOT NULL,
  `decedent_name` varchar(200) NOT NULL,
  `date_of_death` date NOT NULL,
  `county_jurisdiction` varchar(100) DEFAULT 'Salt Lake County',
  `court_case_number` varchar(100) DEFAULT NULL,
  `probate_type` varchar(100) NOT NULL DEFAULT 'Informal Probate',
  `has_will` tinyint(1) NOT NULL DEFAULT 1,
  `personal_rep_name` varchar(200) DEFAULT NULL,
  `personal_rep_role` varchar(100) DEFAULT 'Executor',
  `inventory_value` decimal(12,2) DEFAULT 0.00,
  `status` varchar(50) NOT NULL DEFAULT 'Opened',
  `notice_deadline` date DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `roles`
--

CREATE TABLE `roles` (
  `id` varchar(50) NOT NULL,
  `name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3)
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
  `id` varchar(36) NOT NULL,
  `role_id` varchar(50) NOT NULL,
  `permission_key` varchar(100) NOT NULL,
  `granted_at` datetime(3) NOT NULL DEFAULT current_timestamp(3)
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
  `id` varchar(36) NOT NULL,
  `source_type` varchar(50) NOT NULL,
  `source_identifier` varchar(255) NOT NULL,
  `matter_id` varchar(36) DEFAULT NULL,
  `date` date NOT NULL,
  `actual_duration_seconds` int(11) NOT NULL,
  `suggested_hours` decimal(4,2) NOT NULL,
  `match_confidence` int(11) NOT NULL,
  `activity_description` text NOT NULL,
  `detected_rate` decimal(10,2) DEFAULT NULL,
  `is_converted` tinyint(1) NOT NULL DEFAULT 0,
  `converted_time_entry_id` varchar(36) DEFAULT NULL,
  `is_dismissed` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `tasks`
--

CREATE TABLE `tasks` (
  `id` varchar(36) NOT NULL,
  `task_code` varchar(50) NOT NULL,
  `matter_id` varchar(36) NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `assigned_to_user_id` varchar(36) NOT NULL,
  `created_by_user_id` varchar(36) NOT NULL,
  `due_date` date NOT NULL,
  `priority` varchar(20) NOT NULL DEFAULT 'Medium',
  `status` varchar(30) NOT NULL DEFAULT 'Not Started',
  `completed_at` datetime(3) DEFAULT NULL,
  `reminder_setting` varchar(50) DEFAULT '1 day prior',
  `urcp_rule_reference` varchar(50) DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `tasks`
--

INSERT INTO `tasks` (`id`, `task_code`, `matter_id`, `title`, `description`, `assigned_to_user_id`, `created_by_user_id`, `due_date`, `priority`, `status`, `completed_at`, `reminder_setting`, `urcp_rule_reference`, `created_at`, `updated_at`) VALUES
('24a07424-8588-4fd0-9042-f1eb3e16bb10', 'TSK-26-0003', 'aa405321-481d-4c3c-bd56-ba1fede8e4d7', 'sddxsd', 'eadzsd', '66c97d44-096b-4d34-8bd1-5691ba855e23', '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-18', 'High', 'Completed', '2026-11-18 07:21:31.349', '1 day prior', NULL, '2026-11-18 07:21:25.239', '2026-11-18 07:21:31.351'),
('481a0a56-5c81-43d0-8a33-e8a04d3eceec', 'TSK-26-0006', 'aa405321-481d-4c3c-bd56-ba1fede8e4d7', 'Retain damages/economic expert witness and deliver file', 'Auto-generated by Filevine Workflow Engine upon advancing to \"Expert Discovery\" stage (Civil/Commercial Litigation).', '8640f71a-0142-42f4-a4c0-732537dcd9b7', '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-12-03', 'High', 'Not Started', NULL, '1 day prior', NULL, '2026-11-18 09:51:15.764', '2026-11-18 09:51:15.764'),
('6a113ac5-0036-457d-b559-94546e64af29', 'TSK-26-0005', 'aa405321-481d-4c3c-bd56-ba1fede8e4d7', 'sxzx', 'sazxczx', 'b4144e13-e1b8-4c10-bc62-3ca0966380e0', '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-18', 'High', 'Not Started', NULL, '1 day prior', NULL, '2026-11-18 07:22:23.302', '2026-11-18 07:22:23.302'),
('a01d36c7-9027-432f-a722-99a6f30430d3', 'TSK-26-0004', 'aa405321-481d-4c3c-bd56-ba1fede8e4d7', 'aszxdcxz', 'Recurrence pattern: Weekly (Every Friday). Reminder: 3 days prior.', '66c97d44-096b-4d34-8bd1-5691ba855e23', '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-15', 'High', 'Not Started', NULL, '1 day prior', NULL, '2026-11-18 07:21:47.053', '2026-11-18 07:21:47.053'),
('b409329c-3efa-4ff4-ae40-051028509900', 'TSK-26-0001', 'aa405321-481d-4c3c-bd56-ba1fede8e4d7', 'Follow-up: Missing Adverse Adjuster Details', '[ISSUE:Insurance.adjusterName] Missing Insurance.adjusterName is required for document generation. Please contact the carrier or client to obtain and update this record.', '8640f71a-0142-42f4-a4c0-732537dcd9b7', '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-24', 'High', 'Not Started', NULL, '1 day prior', NULL, '2026-11-17 07:28:28.429', '2026-11-17 07:28:28.429'),
('d48f581c-1564-4a47-8e4c-a165590710c7', 'TSK-26-0002', 'aa405321-481d-4c3c-bd56-ba1fede8e4d7', 'Follow-up: Missing Adverse Insurance Claim Number', '[ISSUE:Insurance.claimNumber] Missing Insurance.claimNumber is required for document generation. Please contact the carrier or client to obtain and update this record.', '8640f71a-0142-42f4-a4c0-732537dcd9b7', '66c97d44-096b-4d34-8bd1-5691ba855e23', '2026-11-24', 'High', 'Not Started', NULL, '1 day prior', NULL, '2026-11-17 07:28:30.077', '2026-11-17 07:28:30.077');

-- --------------------------------------------------------

--
-- Table structure for table `template_versions`
--

CREATE TABLE `template_versions` (
  `id` varchar(36) NOT NULL,
  `template_id` varchar(36) NOT NULL,
  `version_number` varchar(20) NOT NULL,
  `docx_storage_key` varchar(500) NOT NULL,
  `sha256_checksum` varchar(64) NOT NULL,
  `status` varchar(30) NOT NULL DEFAULT 'Draft',
  `change_summary` text DEFAULT NULL,
  `created_by_user_id` varchar(36) NOT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `template_versions`
--

INSERT INTO `template_versions` (`id`, `template_id`, `version_number`, `docx_storage_key`, `sha256_checksum`, `status`, `change_summary`, `created_by_user_id`, `created_at`) VALUES
('1c26eebe-22ee-4a21-9ae0-088e1e6b481b', '427035e4-0a8a-4d8a-a58b-9d7806966e60', 'v1.0', 'storage/templates/113/template_113_v1.0.docx', '052f977cbc430eadecd963b53358947537ede40c7510a3b36ba1484362e11cd9', 'Published', 'Initial verified master production template release.', '1a1c1f3c-1a81-47aa-bad3-ec5fd76b9730', '2026-11-14 07:59:55.045'),
('22c41738-34a9-488c-981c-e25a4a0f4436', '6d2012bd-67cf-45e3-94b4-6ded0ee3739e', 'v1.0', 'storage/templates/115/template_115_v1.0.docx', '15efbfe532fb985a769ad28c76ff5b4625d89c86f7f13986c49684e76b143457', 'Published', 'Initial verified master production template release.', '1a1c1f3c-1a81-47aa-bad3-ec5fd76b9730', '2026-11-14 07:59:55.067'),
('8e72cc61-fc2f-4a0c-9e4d-537e7c782b93', '993555ae-ee1f-43df-961e-197632f6a2e6', 'v1.0', 'storage/templates/112/template_112_v1.0.docx', 'b210bd5d1abb16169804a0a318c00fdf95c89a0c5a8845ca98a313bf12024aaf', 'Published', 'Initial verified master production template release.', '1a1c1f3c-1a81-47aa-bad3-ec5fd76b9730', '2026-11-14 07:59:55.058'),
('b24ab83e-1174-466a-a9e4-41b61aee38ec', 'c0ea16b1-101e-49e0-86e2-578414f2f95a', 'v1.0', 'storage/templates/096/template_096_v1.0.docx', '8a4e7a9e7c10df34f98ccfb6b938a567e93d93ffc48dd31f33dd5be7630cc550', 'Published', 'Initial verified master production template release.', '1a1c1f3c-1a81-47aa-bad3-ec5fd76b9730', '2026-11-14 07:59:55.031'),
('f9c9377f-38da-4bec-834e-ff7250569b6e', '3c17a6da-2357-4ec6-a8d8-13c5f33aa42a', 'v1.0', 'storage/templates/001/template_001_v1.0.docx', 'd0ebee6f289aa8232cb8947cb1659009d86ed0988488430410a9c2423886f61d', 'Published', 'Initial verified master production template release.', '1a1c1f3c-1a81-47aa-bad3-ec5fd76b9730', '2026-11-14 07:59:55.075');

-- --------------------------------------------------------

--
-- Table structure for table `three_way_reconciliations`
--

CREATE TABLE `three_way_reconciliations` (
  `id` varchar(36) NOT NULL,
  `reconciliation_month` varchar(7) NOT NULL,
  `bank_statement_balance` decimal(12,2) NOT NULL,
  `deposits_in_transit` decimal(12,2) NOT NULL DEFAULT 0.00,
  `outstanding_checks` decimal(12,2) NOT NULL DEFAULT 0.00,
  `adjusted_bank_balance` decimal(12,2) NOT NULL,
  `gl_trust_liability_balance` decimal(12,2) NOT NULL,
  `client_subledgers_total_balance` decimal(12,2) NOT NULL,
  `reconciliation_variance` decimal(12,2) NOT NULL,
  `is_balanced` tinyint(1) NOT NULL,
  `audited_by_user_id` varchar(36) NOT NULL,
  `audit_certificate_pdf_url` text DEFAULT NULL,
  `reconciled_at` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `time_entries`
--

CREATE TABLE `time_entries` (
  `id` varchar(36) NOT NULL,
  `entry_code` varchar(50) NOT NULL,
  `matter_id` varchar(36) NOT NULL,
  `user_id` varchar(36) NOT NULL,
  `date` date NOT NULL,
  `hours` decimal(5,2) NOT NULL,
  `rate` decimal(10,2) NOT NULL,
  `amount` decimal(12,2) NOT NULL,
  `activity_type` varchar(100) NOT NULL,
  `activity_code` varchar(50) DEFAULT NULL,
  `description` text NOT NULL,
  `is_billable` tinyint(1) NOT NULL DEFAULT 1,
  `status` varchar(30) NOT NULL DEFAULT 'Submitted',
  `approved_by_user_id` varchar(36) DEFAULT NULL,
  `approved_at` datetime(3) DEFAULT NULL,
  `rejection_comment` text DEFAULT NULL,
  `exported_to_cosmolex` tinyint(1) NOT NULL DEFAULT 0,
  `export_batch_id` varchar(50) DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `trial_notebook_items`
--

CREATE TABLE `trial_notebook_items` (
  `id` varchar(36) NOT NULL,
  `litigation_case_id` varchar(36) NOT NULL,
  `section` varchar(100) NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `admissibility` varchar(50) DEFAULT NULL,
  `order_index` int(11) NOT NULL DEFAULT 0,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `trust_sub_ledgers`
--

CREATE TABLE `trust_sub_ledgers` (
  `id` varchar(36) NOT NULL,
  `ledger_code` varchar(50) NOT NULL,
  `client_id` varchar(36) NOT NULL,
  `matter_id` varchar(36) NOT NULL,
  `balance` decimal(12,2) NOT NULL DEFAULT 0.00,
  `last_audit_date` date NOT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `trust_transactions`
--

CREATE TABLE `trust_transactions` (
  `id` varchar(36) NOT NULL,
  `trust_sub_ledger_id` varchar(36) NOT NULL,
  `transaction_type` varchar(50) NOT NULL,
  `amount` decimal(12,2) NOT NULL,
  `running_balance` decimal(12,2) NOT NULL,
  `source_reference` varchar(100) NOT NULL,
  `authorized_by_user_id` varchar(36) NOT NULL,
  `purpose` text NOT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `unmatched_communications`
--

CREATE TABLE `unmatched_communications` (
  `id` varchar(36) NOT NULL,
  `type` varchar(50) NOT NULL,
  `sender_name` varchar(200) NOT NULL,
  `sender_email` varchar(200) DEFAULT NULL,
  `contact_number` varchar(50) DEFAULT NULL,
  `subject` varchar(255) NOT NULL,
  `preview` text NOT NULL,
  `received_at` datetime(3) NOT NULL,
  `suggested_client_id` varchar(36) DEFAULT NULL,
  `suggested_matter_id` varchar(36) DEFAULT NULL,
  `suggested_client_name` varchar(200) DEFAULT NULL,
  `suggested_matter_label` varchar(255) DEFAULT NULL,
  `matching_status` varchar(50) NOT NULL DEFAULT 'Unmatched',
  `review_notes` text DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `uscis_receipts`
--

CREATE TABLE `uscis_receipts` (
  `id` varchar(36) NOT NULL,
  `immigration_case_id` varchar(36) NOT NULL,
  `receipt_number` varchar(50) NOT NULL,
  `form_type` varchar(50) NOT NULL,
  `filing_date` date NOT NULL,
  `notice_date` date DEFAULT NULL,
  `service_center` varchar(100) DEFAULT NULL,
  `current_status` varchar(150) NOT NULL DEFAULT 'Case Was Received',
  `biometrics_date` datetime(3) DEFAULT NULL,
  `rfe_due_date` date DEFAULT NULL,
  `interview_date` datetime(3) DEFAULT NULL,
  `decision_date` date DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` varchar(36) NOT NULL,
  `user_code` varchar(20) NOT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `phone` varchar(50) DEFAULT NULL,
  `role` varchar(50) NOT NULL,
  `title` varchar(100) DEFAULT NULL,
  `initials` varchar(10) NOT NULL,
  `department` varchar(100) DEFAULT NULL,
  `billing_rate` decimal(10,2) NOT NULL DEFAULT 0.00,
  `status` varchar(20) NOT NULL DEFAULT 'Active',
  `mfa_enabled` tinyint(1) NOT NULL DEFAULT 0,
  `mfa_secret` varchar(255) DEFAULT NULL,
  `last_login_at` datetime(3) DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `user_code`, `name`, `email`, `password_hash`, `phone`, `role`, `title`, `initials`, `department`, `billing_rate`, `status`, `mfa_enabled`, `mfa_secret`, `last_login_at`, `created_at`, `updated_at`) VALUES
('1a1c1f3c-1a81-47aa-bad3-ec5fd76b9730', 'USR-002', 'Thomas Bludworth, Esq.', 't.bludworth.1794562683052@utahslawyers.com', '$2b$12$nCNTzPdqLSeqCwvcgyo7s.vY/lWPLRDRRI7WYgHMsPzZE5q0uFo6O', NULL, 'attorney', 'Litigation Partner', 'TBE', 'Civil Litigation', 500.00, 'Active', 0, NULL, '2026-11-13 09:38:05.131', '2026-11-13 09:38:03.612', '2026-11-13 09:38:05.140'),
('65a70bdd-33bd-4a4d-9dd8-2dcc5e12b8f9', 'USR-008', 'shrie', 's@gmail.com', '$2b$12$1FGxKkFy3G8R6oa4p2Og.OUitO62PtV.u94mWd60rmd0PczrAp5Fa', '32323232132', 'attorney', 'Staff Attorney', 'S', 'Civil Litigation & Commercial', 400.00, 'Active', 0, NULL, NULL, '2026-11-18 07:23:36.941', '2026-11-19 05:52:24.992'),
('66c97d44-096b-4d34-8bd1-5691ba855e23', 'USR-001', 'Eleanor Heugly, Esq.', 'e.heugly@utahslawyers.com', '$2b$12$NyKz7nSTzrX.2dz3BrHZiu/PXvkXqUKtRn94Iraq8uKF3c9Kjmf22', NULL, 'super_admin', 'Managing Partner', 'EH', 'Executive Management', 650.00, 'Active', 0, NULL, '2026-11-19 05:54:16.711', '2026-11-13 09:37:40.346', '2026-11-19 05:54:16.720'),
('8640f71a-0142-42f4-a4c0-732537dcd9b7', 'USR-004', 'Thomas Bludworth, Esq.', 't.bludworth@utahslawyers.com', '$2b$12$u0f5IvLrNJ0QYrWyK.uStOqWd3aD0wpH8F1iNtuU8vxbIbr7.4JD6', NULL, 'attorney', 'Litigation Partner', 'TB', 'Civil Litigation', 550.00, 'Active', 0, NULL, '2026-11-19 05:54:07.448', '2026-11-14 07:02:30.578', '2026-11-19 05:54:07.519'),
('a0b374d7-a8b4-4d42-b4c1-909094f4598b', 'USR-006', 'Marcus Vance', 'm.vance@utahslawyers.com', '$2b$12$u0f5IvLrNJ0QYrWyK.uStOqWd3aD0wpH8F1iNtuU8vxbIbr7.4JD6', NULL, 'paralegal', 'Litigation Paralegal', 'MV', 'Litigation Support', 175.00, 'Active', 0, NULL, '2026-11-14 08:31:00.766', '2026-11-14 07:02:30.607', '2026-11-14 08:31:00.769'),
('af3744b3-df06-4041-bc27-b8d16a8903d7', 'USR-003', 'Thomas Bludworth, Esq.', 't.bludworth.1794562768462@utahslawyers.com', '$2b$12$061n6q85.cDUyTwuO/eUwuHQMRfGxXxtZmFdRI99YBTTuWfKCGP0K', NULL, 'attorney', 'Litigation Partner', 'TBE', 'Civil Litigation', 500.00, 'Active', 0, NULL, '2026-11-13 09:39:30.213', '2026-11-13 09:39:28.862', '2026-11-13 09:39:30.214'),
('b4144e13-e1b8-4c10-bc62-3ca0966380e0', 'USR-007', 'Rachel Adams', 'r.adams@utahslawyers.com', '$2b$12$u0f5IvLrNJ0QYrWyK.uStOqWd3aD0wpH8F1iNtuU8vxbIbr7.4JD6', NULL, 'billing', 'Trust Accountant', 'RA', 'Finance & Escrow', 150.00, 'Active', 0, NULL, '2026-11-14 08:31:08.142', '2026-11-14 07:02:30.615', '2026-11-14 08:31:08.145'),
('eca5d99f-a1cd-43f8-82f2-830acd1a5ddc', 'USR-005', 'David Sterling, Esq.', 'd.sterling@utahslawyers.com', '$2b$12$u0f5IvLrNJ0QYrWyK.uStOqWd3aD0wpH8F1iNtuU8vxbIbr7.4JD6', NULL, 'supervisor', 'Review Counsel', 'DS', 'Practice Management', 400.00, 'Active', 0, NULL, '2026-11-14 08:30:45.878', '2026-11-14 07:02:30.600', '2026-11-14 08:30:45.881');

-- --------------------------------------------------------

--
-- Table structure for table `workflow_stages`
--

CREATE TABLE `workflow_stages` (
  `id` varchar(50) NOT NULL,
  `practice_area_id` varchar(50) NOT NULL,
  `stage_name` varchar(150) NOT NULL,
  `stage_code` varchar(20) NOT NULL,
  `stage_order` int(11) NOT NULL,
  `required_fields` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`required_fields`)),
  `auto_tasks` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`auto_tasks`)),
  `is_active` tinyint(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `workflow_stages`
--

INSERT INTO `workflow_stages` (`id`, `practice_area_id`, `stage_name`, `stage_code`, `stage_order`, `required_fields`, `auto_tasks`, `is_active`) VALUES
('ws-app-1', 'pa-app', 'Notice of Appeal & Transcripts', 'APP-1', 1, '[\"Timely Notice of Appeal Filed\",\"Court Reporter Transcripts Ordered\"]', '[{\"title\":\"Review Trial Record on Appeal Index\",\"priority\":\"High\",\"dueDays\":20,\"role\":\"paralegal\"}]', 1),
('ws-app-2', 'pa-app', 'Appellate Briefing Schedule', 'APP-2', 2, '[\"Appellant Opening Brief Filed\",\"Appellee Response Brief Logged\"]', '[{\"title\":\"Draft Appellant Reply Brief and Request for Argument\",\"priority\":\"Urgent\",\"dueDays\":30,\"role\":\"attorney\"}]', 1),
('ws-app-3', 'pa-app', 'Oral Argument & Opinion Entry', 'APP-3', 3, '[\"Oral Argument Concluded\",\"Appellate Court Opinion Issued\"]', '[{\"title\":\"Evaluate Petition for Rehearing or Remand Execution\",\"priority\":\"High\",\"dueDays\":14,\"role\":\"attorney\"}]', 1),
('ws-bk-1', 'pa-bk', 'Intake & Means Testing Evaluation', 'BK-1', 1, '[\"Tax Returns Received\",\"6 Months Paystubs Received\"]', '[{\"title\":\"Perform Statutory Means Test Calculation (Form 122A/C)\",\"priority\":\"High\",\"dueDays\":7,\"role\":\"attorney\"}]', 1),
('ws-bk-2', 'pa-bk', 'Schedules Assembly & Credit Counseling', 'BK-2', 2, '[\"Credit Counseling Certificate Received\",\"Creditor Matrix Verified\"]', '[{\"title\":\"Schedule Client Petition Signing and Review Conference\",\"priority\":\"High\",\"dueDays\":5,\"role\":\"paralegal\"}]', 1),
('ws-bk-3', 'pa-bk', 'Court Petition Filing & 341 Prep', 'BK-3', 3, '[\"Petition Filed with Bankruptcy Court\",\"Official Case Number Issued\"]', '[{\"title\":\"Deliver Section 521 Tax Documents to Assigned Trustee\",\"priority\":\"Urgent\",\"dueDays\":7,\"role\":\"paralegal\"}]', 1),
('ws-bk-4', 'pa-bk', 'Section 341 Meeting of Creditors', 'BK-4', 4, '[\"341 Examination Concluded\",\"Financial Management Course Certificate Logged\"]', '[{\"title\":\"File Official Financial Management Certificate (Form 423)\",\"priority\":\"High\",\"dueDays\":14,\"role\":\"paralegal\"}]', 1),
('ws-bk-5', 'pa-bk', 'Discharge Order & Case Closure', 'BK-5', 5, '[\"Trustee Report of No Distribution Entered\",\"Discharge Order Entered\"]', '[{\"title\":\"Transmit Official Discharge Package to Debtor\",\"priority\":\"Medium\",\"dueDays\":5,\"role\":\"attorney\"}]', 1),
('ws-civ-1', 'pa-civ', 'Pleadings & Motion Practice', 'CIV-1', 1, '[\"Summons & Complaint Served\",\"Answer or Responsive Motion Logged\"]', '[{\"title\":\"Draft Rule 26 Initial Disclosures\",\"priority\":\"High\",\"dueDays\":14,\"role\":\"paralegal\"}]', 1),
('ws-civ-2', 'pa-civ', 'Written & Electronic Discovery', 'CIV-2', 2, '[\"Rule 26 Disclosures Exchanged\",\"ESI Protocol Order Entered\"]', '[{\"title\":\"Produce Responsive Electronic Records & Bates Index\",\"priority\":\"High\",\"dueDays\":30,\"role\":\"paralegal\"}]', 1),
('ws-civ-3', 'pa-civ', 'Depositions & Expert Witness Phase', 'CIV-3', 3, '[\"Key Party Depositions Transcribed\",\"Expert Reports Exchanged\"]', '[{\"title\":\"Draft Motion for Summary Judgment or Settlement Brief\",\"priority\":\"Urgent\",\"dueDays\":28,\"role\":\"attorney\"}]', 1),
('ws-civ-4', 'pa-civ', 'Trial Preparation & Judgment', 'CIV-4', 4, '[\"Pre-Trial Order Entered\",\"Jury Instructions Assembled\"]', '[{\"title\":\"Attend Trial / Conduct Final Settlement Execution\",\"priority\":\"Urgent\",\"dueDays\":7,\"role\":\"attorney\"}]', 1),
('ws-crim-1', 'pa-crim', 'Arraignment & Discovery Review', 'CRIM-1', 1, '[\"Information/Indictment Received\",\"Bail Conditions Set\"]', '[{\"title\":\"Review Bodycam Footage & Police Incident Reports\",\"priority\":\"High\",\"dueDays\":10,\"role\":\"attorney\"}]', 1),
('ws-crim-2', 'pa-crim', 'Suppression Motions & Plea Talks', 'CRIM-2', 2, '[\"Preliminary Hearing Waived or Conducted\",\"Plea Offer Evaluated\"]', '[{\"title\":\"File Fourth Amendment Motion to Suppress Evidence\",\"priority\":\"Urgent\",\"dueDays\":14,\"role\":\"attorney\"}]', 1),
('ws-crim-3', 'pa-crim', 'Trial Setting or Sentencing Disposition', 'CRIM-3', 3, '[\"Plea Agreement Executed or Jury Verdict Entered\"]', '[{\"title\":\"Prepare Sentencing Memorandum and Mitigating Exhibits\",\"priority\":\"High\",\"dueDays\":14,\"role\":\"attorney\"}]', 1),
('ws-evict-1', 'pa-evict', 'Statutory Notice & Summons', 'EVICT-1', 1, '[\"Three-Day Notice Served\",\"Unlawful Detainer Complaint Filed\"]', '[{\"title\":\"Complete Expedited Process Service on Tenant\",\"priority\":\"Urgent\",\"dueDays\":3,\"role\":\"paralegal\"}]', 1),
('ws-evict-2', 'pa-evict', 'Occupancy Hearing & Writ', 'EVICT-2', 2, '[\"Immediate Occupancy Hearing Held\",\"Order of Restitution Issued\"]', '[{\"title\":\"Deliver Writ of Restitution to County Sheriff\",\"priority\":\"Urgent\",\"dueDays\":2,\"role\":\"paralegal\"}]', 1),
('ws-evict-3', 'pa-evict', 'Damages Judgment & Collection', 'EVICT-3', 3, '[\"Physical Possession Restored\",\"Treble Damages Proof Filed\"]', '[{\"title\":\"Enter Final Civil Monetary Judgment against Tenant\",\"priority\":\"Medium\",\"dueDays\":14,\"role\":\"attorney\"}]', 1),
('ws-fam-1', 'pa-fam', 'Petition & Temporary Orders', 'FAM-1', 1, '[\"Petition Served\",\"Financial Declarations Completed\"]', '[{\"title\":\"Request Temporary Custody and Support Hearing\",\"priority\":\"Urgent\",\"dueDays\":14,\"role\":\"attorney\"}]', 1),
('ws-fam-2', 'pa-fam', 'Mandatory Mediation & Discovery', 'FAM-2', 2, '[\"Full Financial Disclosures Exchanged\",\"Mediation Session Conducted\"]', '[{\"title\":\"Draft Settlement Stipulation or Pre-Trial Readiness Statement\",\"priority\":\"High\",\"dueDays\":21,\"role\":\"attorney\"}]', 1),
('ws-fam-3', 'pa-fam', 'Decree Entry & Enforcement', 'FAM-3', 3, '[\"Findings of Fact & Decree Signed by Judge\"]', '[{\"title\":\"Submit Qualified Domestic Relations Order (QDRO)\",\"priority\":\"High\",\"dueDays\":15,\"role\":\"paralegal\"}]', 1),
('ws-imm-1', 'pa-imm', 'Eligibility & Questionnaire Audit', 'IMM-1', 1, '[\"Client Identity Documents Verified\",\"Prior Immigration History Cleared\"]', '[{\"title\":\"Complete USCIS Petition Questionnaire Form Assembly\",\"priority\":\"High\",\"dueDays\":10,\"role\":\"paralegal\"}]', 1),
('ws-imm-2', 'pa-imm', 'Petition Assembly & Legal Review', 'IMM-2', 2, '[\"All Civil Documents Translated\",\"Filing Fee Checks Prepared\"]', '[{\"title\":\"Attorney Final Quality Verification and Form Signing\",\"priority\":\"High\",\"dueDays\":5,\"role\":\"attorney\"}]', 1),
('ws-imm-3', 'pa-imm', 'USCIS Filing & I-797C Receipts', 'IMM-3', 3, '[\"Courier Delivery Confirmed\",\"Form I-797C Notice of Action Receipt Logged\"]', '[{\"title\":\"Set 90-Day USCIS Processing Status Audit Alert\",\"priority\":\"Medium\",\"dueDays\":90,\"role\":\"paralegal\"}]', 1),
('ws-imm-4', 'pa-imm', 'Biometrics & RFE Processing', 'IMM-4', 4, '[\"ASC Biometrics Appointment Attended\"]', '[{\"title\":\"Prepare Response to Any Request for Evidence (RFE)\",\"priority\":\"Urgent\",\"dueDays\":30,\"role\":\"attorney\"}]', 1),
('ws-imm-5', 'pa-imm', 'Field Office Interview & Adjudication', 'IMM-5', 5, '[\"USCIS Interview Notice Logged\",\"Mock Client Interview Executed\"]', '[{\"title\":\"Attend USCIS Field Office Interview with Client\",\"priority\":\"Urgent\",\"dueDays\":10,\"role\":\"attorney\"}]', 1),
('ws-imm-6', 'pa-imm', 'Permanent Residency Approval & Closure', 'IMM-6', 6, '[\"Approval Notice Received\",\"Physical Card Delivery Verified\"]', '[{\"title\":\"Deliver Secure Immigration Vault Archival Package\",\"priority\":\"Low\",\"dueDays\":5,\"role\":\"attorney\"}]', 1),
('ws-pi-1', 'pa-pi', 'Intake & Conflict Clearance', 'PI-1', 1, '[\"Conflict Cleared\",\"Signed Contingency Retainer Agreement\"]', '[{\"title\":\"Request Police Accident Report\",\"priority\":\"High\",\"dueDays\":5,\"role\":\"paralegal\"}]', 1),
('ws-pi-2', 'pa-pi', 'Investigation & Medical Records', 'PI-2', 2, '[\"Police Report Received\",\"Medical Authorizations Dispatched\"]', '[{\"title\":\"Send Letter of Representation to Insurance Adjuster\",\"priority\":\"High\",\"dueDays\":3,\"role\":\"attorney\"}]', 1),
('ws-pi-3', 'pa-pi', 'Medical Special Demand Package', 'PI-3', 3, '[\"All Medical Specials Received\",\"Demand Letter Drafted\"]', '[{\"title\":\"Review Insurance Policy Limits and Demand Response\",\"priority\":\"Medium\",\"dueDays\":30,\"role\":\"attorney\"}]', 1),
('ws-pi-4', 'pa-pi', 'Pleadings & Formal Service', 'PI-4', 4, '[\"Complaint Filed in District Court\",\"Summons Issued\"]', '[{\"title\":\"Execute Service of Process on Defendant Driver & Owner\",\"priority\":\"Urgent\",\"dueDays\":20,\"role\":\"paralegal\"}]', 1),
('ws-pi-5', 'pa-pi', 'Fact & Expert Discovery', 'PI-5', 5, '[\"Rule 26 Initial Disclosures Exchanged\",\"Written Interrogatories Served\"]', '[{\"title\":\"Depose Defendant Driver & Defense Medical Examiner\",\"priority\":\"High\",\"dueDays\":45,\"role\":\"attorney\"}]', 1),
('ws-pi-6', 'pa-pi', 'Mediation & Pre-Trial Readiness', 'PI-6', 6, '[\"Mediation Statement Submitted\",\"Rule 26(a)(4) Pretrial Disclosures Ready\"]', '[{\"title\":\"Conduct Formal Pre-Trial Settlement Conference\",\"priority\":\"Urgent\",\"dueDays\":14,\"role\":\"attorney\"}]', 1),
('ws-pi-7', 'pa-pi', 'Resolution, Liens & Disbursement', 'PI-7', 7, '[\"Settlement Agreement Executed\",\"Healthcare Subrogation Liens Negotiated\"]', '[{\"title\":\"Draft Settlement Closing Statement and Disburse Trust Funds\",\"priority\":\"High\",\"dueDays\":7,\"role\":\"billing\"}]', 1),
('ws-prob-1', 'pa-prob', 'Petition for Probate & Heirs Notice', 'PROB-1', 1, '[\"Death Certificate Logged\",\"Original Will Deposited\"]', '[{\"title\":\"Publish Notice to Creditors in Salt Lake Tribune\",\"priority\":\"High\",\"dueDays\":10,\"role\":\"paralegal\"}]', 1),
('ws-prob-2', 'pa-prob', 'Letters Testamentary & Inventory', 'PROB-2', 2, '[\"Letters Testamentary Issued\",\"Estate Bank Account Opened\"]', '[{\"title\":\"Compile Formal Estate Inventory and Asset Appraisal\",\"priority\":\"High\",\"dueDays\":60,\"role\":\"paralegal\"}]', 1),
('ws-prob-3', 'pa-prob', 'Creditor Audit & Final Distribution', 'PROB-3', 3, '[\"Statutory 90-Day Creditor Notice Expired\",\"Estate Tax Clearance Received\"]', '[{\"title\":\"File Final Accounting & Petition for Complete Settlement\",\"priority\":\"High\",\"dueDays\":20,\"role\":\"attorney\"}]', 1);

-- --------------------------------------------------------

--
-- Table structure for table `_prisma_migrations`
--

CREATE TABLE `_prisma_migrations` (
  `id` varchar(36) NOT NULL,
  `checksum` varchar(64) NOT NULL,
  `finished_at` datetime(3) DEFAULT NULL,
  `migration_name` varchar(255) NOT NULL,
  `logs` text DEFAULT NULL,
  `rolled_back_at` datetime(3) DEFAULT NULL,
  `started_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `applied_steps_count` int(10) UNSIGNED NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `_prisma_migrations`
--

INSERT INTO `_prisma_migrations` (`id`, `checksum`, `finished_at`, `migration_name`, `logs`, `rolled_back_at`, `started_at`, `applied_steps_count`) VALUES
('5e3c3502-8397-4d3d-bf99-7e593ebd9368', '681d1d95d3b13bc38f590e5044b56bd8eaeb04fc17dd4cbc7502fdcf9f2f2f2e', '2026-11-13 07:38:56.519', '20261113071216_init', NULL, NULL, '2026-11-13 07:38:54.871', 1),
('ba233eba-8e63-4b93-8fe4-698892a5b699', '9c51bee953822a14b716ef14c94591e786e1fce48cb94d5238e724a54ee91f5f', '2026-11-13 09:34:28.802', '20261113093500_add_intake_converted_matter', NULL, NULL, '2026-11-13 09:34:28.685', 1),
('ce70815f-98e0-465a-8a44-3cb5a66a0c0c', 'd726eca224c3dfecd64dfffba987df952345489da227da0c41cfd6a0caa7d6ba', '2026-11-14 06:57:56.761', '20261113124707_add_document_automation_foundation', NULL, NULL, '2026-11-14 06:57:55.057', 1),
('1a5d195a-b985-4d09-80ca-2ea0df87cfa5', '9777d21d0d1d764327e010c59d4885000eb41b8105ea72a0cb6fd3a5d0f2c3d7', NULL, '20261114080000_add_pi_shared_data_model', 'A migration failed to apply. New migrations cannot be applied before the error is recovered from. Read more about how to resolve migration issues in a production database: https://pris.ly/d/migrate-resolve\n\nMigration name: 20261114080000_add_pi_shared_data_model\n\nDatabase error code: 1005\n\nDatabase error:\nCan\'t create table `legal-db`.`pi_incidents` (errno: 150 \"Foreign key constraint is incorrectly formed\")\n\nPlease check the query number 5 from the migration file.\n\n   0: sql_schema_connector::apply_migration::apply_script\n           with migration_name=\"20261114080000_add_pi_shared_data_model\"\n             at schema-engine\\connectors\\sql-schema-connector\\src\\apply_migration.rs:106\n   1: schema_core::commands::apply_migrations::Applying migration\n           with migration_name=\"20261114080000_add_pi_shared_data_model\"\n             at schema-engine\\core\\src\\commands\\apply_migrations.rs:91\n   2: schema_core::state::ApplyMigrations\n             at schema-engine\\core\\src\\state.rs:226', NULL, '2026-11-17 07:18:25.921', 0);

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
-- Indexes for table `matter_overview_panels`
--
ALTER TABLE `matter_overview_panels`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `matter_overview_panels_matter_id_key` (`matter_id`);

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
  ADD CONSTRAINT `calendar_events_created_by_user_id_fkey` FOREIGN KEY (`created_by_user_id`) REFERENCES `users` (`id`) ON UPDATE CASCADE,
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
  ADD CONSTRAINT `conflict_search_logs_searched_by_user_id_fkey` FOREIGN KEY (`searched_by_user_id`) REFERENCES `users` (`id`) ON UPDATE CASCADE;

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
  ADD CONSTRAINT `documents_client_id_fkey` FOREIGN KEY (`client_id`) REFERENCES `clients` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `documents_matter_id_fkey` FOREIGN KEY (`matter_id`) REFERENCES `matters` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `document_drafts`
--
ALTER TABLE `document_drafts`
  ADD CONSTRAINT `document_drafts_client_id_fkey` FOREIGN KEY (`client_id`) REFERENCES `clients` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `document_drafts_final_document_id_fkey` FOREIGN KEY (`final_document_id`) REFERENCES `documents` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `document_drafts_generated_by_user_id_fkey` FOREIGN KEY (`generated_by_user_id`) REFERENCES `users` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `document_drafts_matter_id_fkey` FOREIGN KEY (`matter_id`) REFERENCES `matters` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `document_drafts_reviewed_by_user_id_fkey` FOREIGN KEY (`reviewed_by_user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `document_drafts_template_id_fkey` FOREIGN KEY (`template_id`) REFERENCES `document_templates` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `document_drafts_template_version_id_fkey` FOREIGN KEY (`template_version_id`) REFERENCES `template_versions` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `document_field_mappings`
--
ALTER TABLE `document_field_mappings`
  ADD CONSTRAINT `document_field_mappings_template_version_id_fkey` FOREIGN KEY (`template_version_id`) REFERENCES `template_versions` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `document_templates`
--
ALTER TABLE `document_templates`
  ADD CONSTRAINT `document_templates_created_by_user_id_fkey` FOREIGN KEY (`created_by_user_id`) REFERENCES `users` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `document_templates_practice_area_id_fkey` FOREIGN KEY (`practice_area_id`) REFERENCES `practice_areas` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `document_versions`
--
ALTER TABLE `document_versions`
  ADD CONSTRAINT `document_versions_document_id_fkey` FOREIGN KEY (`document_id`) REFERENCES `documents` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `document_versions_uploaded_by_user_id_fkey` FOREIGN KEY (`uploaded_by_user_id`) REFERENCES `users` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `evictions_cases`
--
ALTER TABLE `evictions_cases`
  ADD CONSTRAINT `evictions_cases_matter_id_fkey` FOREIGN KEY (`matter_id`) REFERENCES `matters` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `expenses`
--
ALTER TABLE `expenses`
  ADD CONSTRAINT `expenses_incurred_by_user_id_fkey` FOREIGN KEY (`incurred_by_user_id`) REFERENCES `users` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `expenses_matter_id_fkey` FOREIGN KEY (`matter_id`) REFERENCES `matters` (`id`) ON UPDATE CASCADE;

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
  ADD CONSTRAINT `general_ledger_entries_account_number_fkey` FOREIGN KEY (`account_number`) REFERENCES `chart_of_accounts` (`account_number`) ON UPDATE CASCADE,
  ADD CONSTRAINT `general_ledger_entries_journal_id_fkey` FOREIGN KEY (`journal_id`) REFERENCES `general_ledger_journals` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `general_ledger_entries_matter_id_fkey` FOREIGN KEY (`matter_id`) REFERENCES `matters` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `general_ledger_journals`
--
ALTER TABLE `general_ledger_journals`
  ADD CONSTRAINT `general_ledger_journals_created_by_user_id_fkey` FOREIGN KEY (`created_by_user_id`) REFERENCES `users` (`id`) ON UPDATE CASCADE;

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
  ADD CONSTRAINT `invoices_client_id_fkey` FOREIGN KEY (`client_id`) REFERENCES `clients` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `invoices_matter_id_fkey` FOREIGN KEY (`matter_id`) REFERENCES `matters` (`id`) ON UPDATE CASCADE;

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
  ADD CONSTRAINT `matters_client_id_fkey` FOREIGN KEY (`client_id`) REFERENCES `clients` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `matters_current_stage_id_fkey` FOREIGN KEY (`current_stage_id`) REFERENCES `workflow_stages` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `matters_practice_area_id_fkey` FOREIGN KEY (`practice_area_id`) REFERENCES `practice_areas` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `matters_responsible_attorney_id_fkey` FOREIGN KEY (`responsible_attorney_id`) REFERENCES `users` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `matter_overview_panels`
--
ALTER TABLE `matter_overview_panels`
  ADD CONSTRAINT `matter_overview_panels_matter_id_fkey` FOREIGN KEY (`matter_id`) REFERENCES `matters` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

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
  ADD CONSTRAINT `matter_stage_histories_to_stage_id_fkey` FOREIGN KEY (`to_stage_id`) REFERENCES `workflow_stages` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `matter_stage_histories_transitioned_by_user_id_fkey` FOREIGN KEY (`transitioned_by_user_id`) REFERENCES `users` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `payment_records`
--
ALTER TABLE `payment_records`
  ADD CONSTRAINT `payment_records_client_id_fkey` FOREIGN KEY (`client_id`) REFERENCES `clients` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `payment_records_invoice_id_fkey` FOREIGN KEY (`invoice_id`) REFERENCES `invoices` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `payment_records_recorded_by_user_id_fkey` FOREIGN KEY (`recorded_by_user_id`) REFERENCES `users` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `pi_damages_records`
--
ALTER TABLE `pi_damages_records`
  ADD CONSTRAINT `pi_damages_records_matter_id_fkey` FOREIGN KEY (`matter_id`) REFERENCES `matters` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `pi_demand_packages`
--
ALTER TABLE `pi_demand_packages`
  ADD CONSTRAINT `pi_demand_packages_approved_by_attorney_id_fkey` FOREIGN KEY (`approved_by_attorney_id`) REFERENCES `users` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `pi_demand_packages_draft_document_id_fkey` FOREIGN KEY (`draft_document_id`) REFERENCES `documents` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `pi_demand_packages_insurance_policy_id_fkey` FOREIGN KEY (`insurance_policy_id`) REFERENCES `pi_insurance_policies` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `pi_demand_packages_matter_id_fkey` FOREIGN KEY (`matter_id`) REFERENCES `matters` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `pi_diagnostic_studies`
--
ALTER TABLE `pi_diagnostic_studies`
  ADD CONSTRAINT `pi_diagnostic_studies_damages_record_id_fkey` FOREIGN KEY (`damages_record_id`) REFERENCES `pi_damages_records` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `pi_diagnostic_studies_imaging_report_document_id_fkey` FOREIGN KEY (`imaging_report_document_id`) REFERENCES `documents` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `pi_diagnostic_studies_matter_id_fkey` FOREIGN KEY (`matter_id`) REFERENCES `matters` (`id`) ON UPDATE CASCADE;

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
  ADD CONSTRAINT `pi_liens_final_payoff_letter_document_id_fkey` FOREIGN KEY (`final_payoff_letter_document_id`) REFERENCES `documents` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `pi_liens_matter_id_fkey` FOREIGN KEY (`matter_id`) REFERENCES `matters` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `pi_liens_provider_id_fkey` FOREIGN KEY (`provider_id`) REFERENCES `pi_medical_providers` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `pi_lien_negotiations`
--
ALTER TABLE `pi_lien_negotiations`
  ADD CONSTRAINT `pi_lien_negotiations_conducted_by_user_id_fkey` FOREIGN KEY (`conducted_by_user_id`) REFERENCES `users` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `pi_lien_negotiations_lien_id_fkey` FOREIGN KEY (`lien_id`) REFERENCES `pi_liens` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `pi_medical_billing_summaries`
--
ALTER TABLE `pi_medical_billing_summaries`
  ADD CONSTRAINT `pi_medical_billing_summaries_billing_ledger_document_id_fkey` FOREIGN KEY (`billing_ledger_document_id`) REFERENCES `documents` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `pi_medical_billing_summaries_matter_id_fkey` FOREIGN KEY (`matter_id`) REFERENCES `matters` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `pi_medical_billing_summaries_provider_id_matter_id_fkey` FOREIGN KEY (`provider_id`,`matter_id`) REFERENCES `pi_medical_providers` (`id`, `matter_id`) ON UPDATE CASCADE;

--
-- Constraints for table `pi_medical_payment_records`
--
ALTER TABLE `pi_medical_payment_records`
  ADD CONSTRAINT `pi_medical_payment_records_billing_summary_id_fkey` FOREIGN KEY (`billing_summary_id`) REFERENCES `pi_medical_billing_summaries` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `pi_medical_payment_records_created_by_user_id_fkey` FOREIGN KEY (`created_by_user_id`) REFERENCES `users` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `pi_medical_payment_records_eob_document_id_fkey` FOREIGN KEY (`eob_document_id`) REFERENCES `documents` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `pi_medical_payment_records_reversal_of_record_id_fkey` FOREIGN KEY (`reversal_of_record_id`) REFERENCES `pi_medical_payment_records` (`id`) ON UPDATE CASCADE;

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
  ADD CONSTRAINT `pi_settlement_disbursements_matter_id_fkey` FOREIGN KEY (`matter_id`) REFERENCES `matters` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `pi_settlement_disbursement_versions`
--
ALTER TABLE `pi_settlement_disbursement_versions`
  ADD CONSTRAINT `pi_settlement_disbursement_versions_approved_by_attorney_id_fkey` FOREIGN KEY (`approved_by_attorney_id`) REFERENCES `users` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `pi_settlement_disbursement_versions_created_by_user_id_fkey` FOREIGN KEY (`created_by_user_id`) REFERENCES `users` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `pi_settlement_disbursement_versions_settlement_disbursement_fkey` FOREIGN KEY (`settlement_disbursement_id`) REFERENCES `pi_settlement_disbursements` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `pi_settlement_disbursement_versions_signed_closing_statemen_fkey` FOREIGN KEY (`signed_closing_statement_doc_id`) REFERENCES `documents` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `pi_settlement_executions`
--
ALTER TABLE `pi_settlement_executions`
  ADD CONSTRAINT `pi_settlement_executions_executed_by_user_id_fkey` FOREIGN KEY (`executed_by_user_id`) REFERENCES `users` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `pi_settlement_executions_settlement_version_id_fkey` FOREIGN KEY (`settlement_version_id`) REFERENCES `pi_settlement_disbursement_versions` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `pi_settlement_executions_trust_sub_ledger_id_fkey` FOREIGN KEY (`trust_sub_ledger_id`) REFERENCES `trust_sub_ledgers` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `pi_settlement_execution_lines`
--
ALTER TABLE `pi_settlement_execution_lines`
  ADD CONSTRAINT `pi_settlement_execution_lines_lien_id_fkey` FOREIGN KEY (`lien_id`) REFERENCES `pi_liens` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `pi_settlement_execution_lines_settlement_execution_id_trust_fkey` FOREIGN KEY (`settlement_execution_id`,`trust_sub_ledger_id`) REFERENCES `pi_settlement_executions` (`id`, `trust_sub_ledger_id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `pi_settlement_execution_lines_trust_transaction_id_trust_su_fkey` FOREIGN KEY (`trust_transaction_id`,`trust_sub_ledger_id`) REFERENCES `trust_transactions` (`id`, `trust_sub_ledger_id`) ON UPDATE CASCADE;

--
-- Constraints for table `pi_vendor_assignments`
--
ALTER TABLE `pi_vendor_assignments`
  ADD CONSTRAINT `pi_vendor_assignments_assigned_staff_id_fkey` FOREIGN KEY (`assigned_staff_id`) REFERENCES `users` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `pi_vendor_assignments_expense_id_fkey` FOREIGN KEY (`expense_id`) REFERENCES `expenses` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `pi_vendor_assignments_matter_id_fkey` FOREIGN KEY (`matter_id`) REFERENCES `matters` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `pi_vendor_assignments_report_document_id_fkey` FOREIGN KEY (`report_document_id`) REFERENCES `documents` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `pi_vendor_assignments_vendor_id_fkey` FOREIGN KEY (`vendor_id`) REFERENCES `pi_vendors` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `pi_wage_loss_records`
--
ALTER TABLE `pi_wage_loss_records`
  ADD CONSTRAINT `pi_wage_loss_records_matter_id_fkey` FOREIGN KEY (`matter_id`) REFERENCES `matters` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `pi_wage_loss_records_verification_document_id_fkey` FOREIGN KEY (`verification_document_id`) REFERENCES `documents` (`id`) ON UPDATE CASCADE;

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
  ADD CONSTRAINT `tasks_assigned_to_user_id_fkey` FOREIGN KEY (`assigned_to_user_id`) REFERENCES `users` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `tasks_created_by_user_id_fkey` FOREIGN KEY (`created_by_user_id`) REFERENCES `users` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `tasks_matter_id_fkey` FOREIGN KEY (`matter_id`) REFERENCES `matters` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `template_versions`
--
ALTER TABLE `template_versions`
  ADD CONSTRAINT `template_versions_created_by_user_id_fkey` FOREIGN KEY (`created_by_user_id`) REFERENCES `users` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `template_versions_template_id_fkey` FOREIGN KEY (`template_id`) REFERENCES `document_templates` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `three_way_reconciliations`
--
ALTER TABLE `three_way_reconciliations`
  ADD CONSTRAINT `three_way_reconciliations_audited_by_user_id_fkey` FOREIGN KEY (`audited_by_user_id`) REFERENCES `users` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `time_entries`
--
ALTER TABLE `time_entries`
  ADD CONSTRAINT `time_entries_approved_by_user_id_fkey` FOREIGN KEY (`approved_by_user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `time_entries_matter_id_fkey` FOREIGN KEY (`matter_id`) REFERENCES `matters` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `time_entries_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `trial_notebook_items`
--
ALTER TABLE `trial_notebook_items`
  ADD CONSTRAINT `trial_notebook_items_litigation_case_id_fkey` FOREIGN KEY (`litigation_case_id`) REFERENCES `litigation_cases` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `trust_sub_ledgers`
--
ALTER TABLE `trust_sub_ledgers`
  ADD CONSTRAINT `trust_sub_ledgers_client_id_fkey` FOREIGN KEY (`client_id`) REFERENCES `clients` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `trust_sub_ledgers_matter_id_fkey` FOREIGN KEY (`matter_id`) REFERENCES `matters` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `trust_transactions`
--
ALTER TABLE `trust_transactions`
  ADD CONSTRAINT `trust_transactions_authorized_by_user_id_fkey` FOREIGN KEY (`authorized_by_user_id`) REFERENCES `users` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `trust_transactions_trust_sub_ledger_id_fkey` FOREIGN KEY (`trust_sub_ledger_id`) REFERENCES `trust_sub_ledgers` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `uscis_receipts`
--
ALTER TABLE `uscis_receipts`
  ADD CONSTRAINT `uscis_receipts_immigration_case_id_fkey` FOREIGN KEY (`immigration_case_id`) REFERENCES `immigration_cases` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `users`
--
ALTER TABLE `users`
  ADD CONSTRAINT `users_role_fkey` FOREIGN KEY (`role`) REFERENCES `roles` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `workflow_stages`
--
ALTER TABLE `workflow_stages`
  ADD CONSTRAINT `workflow_stages_practice_area_id_fkey` FOREIGN KEY (`practice_area_id`) REFERENCES `practice_areas` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
