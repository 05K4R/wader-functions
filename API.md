# API Reference
The following functions are documented for easy reference, and should be expected to change until version 1 of Wader Functions.
At the moment, functions can only be called by a user that has signed in, so all references to *you* refers to that signed in user.

## updateProfile
Update the specified profile, or create it if it doesn't exist.

### Input
`profileId: String` - The ID of the profile to update or create.
`profileInfo: JSON` - Additional profile information as follows:
```
{
    name: String (optional),
    url: String (optional)
}
```

## getGroupRatios
Returns all category and label ratios for tracks uploaded by a specific profile.

### Arguments
`profileId: String` - The ID of the profile to receive ratios for.

### Response
```
{
    labels: {
        [labelName]: [number of tracks that has this label]
    },
    categories: {
        [categoryName]: [number of tracks that has this category]
    }
}
```
