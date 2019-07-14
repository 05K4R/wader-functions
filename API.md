# API Reference
The following functions are documented for easy reference, and should be expected to change until version 1 of Wader Functions.
At the moment, functions can only be called by a user that has signed in, so all references to *you* refers to that signed in user.
All input and output uses JSON.

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
