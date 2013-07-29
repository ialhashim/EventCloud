-- phpMyAdmin SQL Dump
-- version 3.5.2.2
-- http://www.phpmyadmin.net
--
-- Host: 127.0.0.1
-- Generation Time: Jul 29, 2013 at 08:39 PM
-- Server version: 5.5.27
-- PHP Version: 5.4.7

SET SQL_MODE="NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;

--
-- Database: `event_cloud`
--

-- --------------------------------------------------------

--
-- Table structure for table `chunks`
--

CREATE TABLE IF NOT EXISTS `chunks` (
  `cid` int(11) NOT NULL AUTO_INCREMENT,
  `eid` int(11) NOT NULL,
  `index` int(11) NOT NULL,
  `start` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `length` int(11) NOT NULL,
  PRIMARY KEY (`cid`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci AUTO_INCREMENT=4 ;

--
-- Dumping data for table `chunks`
--

INSERT INTO `chunks` (`cid`, `eid`, `index`, `start`, `length`) VALUES
(1, 1, 0, '2013-07-14 07:31:30', 10),
(2, 1, 1, '2013-07-14 07:31:51', 10),
(3, 1, 2, '2013-07-14 07:52:45', 10);

-- --------------------------------------------------------

--
-- Table structure for table `events`
--

CREATE TABLE IF NOT EXISTS `events` (
  `eid` int(11) NOT NULL AUTO_INCREMENT,
  `name` text COLLATE utf8_unicode_ci NOT NULL,
  `chunks` int(11) NOT NULL DEFAULT '60',
  `start` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `maptype` text COLLATE utf8_unicode_ci NOT NULL,
  `lat` decimal(18,14) NOT NULL,
  `long` decimal(18,14) NOT NULL,
  `poster` text COLLATE utf8_unicode_ci NOT NULL,
  PRIMARY KEY (`eid`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci AUTO_INCREMENT=2 ;

--
-- Dumping data for table `events`
--

INSERT INTO `events` (`eid`, `name`, `chunks`, `start`, `maptype`, `lat`, `long`, `poster`) VALUES
(1, 'Event Name', 60, '2013-07-14 07:31:29', 'real', 49.27835970000000, -122.90390010000000, '');

-- --------------------------------------------------------

--
-- Table structure for table `media`
--

CREATE TABLE IF NOT EXISTS `media` (
  `mid` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `uid` int(11) NOT NULL,
  `cid` int(11) NOT NULL,
  `meta` text COLLATE utf8_unicode_ci NOT NULL,
  `timestamp` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `lat` decimal(18,14) NOT NULL,
  `long` decimal(18,14) NOT NULL,
  `type` text COLLATE utf8_unicode_ci NOT NULL,
  `caption` text COLLATE utf8_unicode_ci NOT NULL,
  PRIMARY KEY (`mid`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci AUTO_INCREMENT=6 ;

--
-- Dumping data for table `media`
--

INSERT INTO `media` (`mid`, `uid`, `cid`, `meta`, `timestamp`, `lat`, `long`, `type`, `caption`) VALUES
(1, 1, 1, '', '2013-07-14 07:31:30', 49.27835970000000, -122.90390010000000, 'png', 'Event Name / 1'),
(2, 1, 1, '', '2013-07-14 07:31:31', 49.27835970000000, -122.90390010000000, 'png', 'Event Name / 2'),
(3, 1, 1, '', '2013-07-14 07:31:31', 49.27835970000000, -122.90390010000000, 'png', 'Event Name / 3'),
(4, 1, 2, '', '2013-07-14 07:31:51', 49.27834120000000, -122.90387320000000, 'jpg', 'Event Name / 4'),
(5, 1, 3, '', '2013-07-14 07:52:45', 49.22949100000000, -123.00257500000000, 'jpg', 'Event Name / 5');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE IF NOT EXISTS `users` (
  `uid` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `name` text COLLATE utf8_unicode_ci NOT NULL,
  PRIMARY KEY (`uid`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci AUTO_INCREMENT=4 ;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`uid`, `name`) VALUES
(1, 'User'),
(2, 'hh'),
(3, 'æŽå®åŽ');

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
