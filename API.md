# API Reference
The following functions are documented for easy reference, and should be expected to change until version 1 of Wader Functions.
All input and output is JSON.

## updateProfile
Update a profile, or create it if it doesn't exist.

### Input
```
profileInfo: Object
    url: String
    name: String (optional)
```

## updateTrack
Update a track, or create it if it doesn't exist. Also updates or creates the corresponding uploader profile.

### Input
```
trackInfo: Object
    url: String
    name: String (optional)
    uploaderInfo: Object
        url: String
        name: String (optional)
```

## updateRepost
Update a repost, or create it if it doesn't exist. Also updates or creates the corresponding track, reposter, and uploader profile.

### Input
```
repostInfo: Object
    time: number, Unix timestamp in seconds
    reposterInfo: Object
        url: String
        name: String (optional)
    trackInfo: Object
        url: String
        name: String (optional)
        uploaderInfo: Object
            url: String
            name: String (optional)
```

## setCategoryOnTrack
Set a category on a track. A track can have at most one category, if the track already has a category it is replaced. Also updates the corresponding track and uploader profile.

### Input
```
category: String, valid values: great, good, okay, bad (case insensitive)
trackInfo: Object
    url: String
    name: String (optional)
    uploaderInfo: Object
        url: String
        name: String (optional)
```

## getProfileScore
Get the score for a profile. The score is calculated as follows: 2*[# great tracks] + [# good tracks] - [# bad tracks], or 0 if less than 20 tracks has been categorized for the profile.

### Input
```
profileInfo: Object
    url: String
```
