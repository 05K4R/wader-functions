# Changelog
The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## 0.5.0 - 2021-07-17
### Added
- Support for profile, tracks, and repost writes.

### Changed
- Updated functions to Node 14.

### Security
- Updated dependencies.

## 0.4.0 - 2020-05-25
### Added
- Support for playlist and playlist repost writes.
- Categorized tracks in playlists and reposted playlists are now included in the profile score.

### Removed
- Arbitrary writes to a user's own collections.

## 0.3.0 - 2019-11-24
### Changed
- Changed category scores to great: 30, good: 20, okay: -1, bad: -20.

## 0.2.1 - 2019-08-10
### Fixed
- Uncategorized tracks are no longer incorrectly counted towards the minimum track amount.

## 0.2.0 - 2019-07-21
### Added
- This changelog!
- An API reference
- updateProfile function
- updateTrack function
- updateRepost function
- setCategoryOnTrack function
- getProfileScore function

### Removed
- getGroupRatios function

## 0.1.0 - 2018-08-26
### Added
- getGroupRatios function
