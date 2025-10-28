# Station Upload Middleware

## Overview
This middleware handles file uploads for station images and wallpapers, storing them in separate directories as requested.

## Directory Structure
- **Images**: `src/public/uploads/station/image/` - Station profile images
- **Wallpapers**: `src/public/uploads/station/wallpaper/` - Station background images
- **Fallback**: `src/public/uploads/station/` - Default directory if fieldname doesn't match

## Features

### File Storage
- **Dynamic Destination**: Files are stored in different directories based on fieldname
  - `image` field → `src/public/uploads/station/image/`
  - `wallpaper` field → `src/public/uploads/station/wallpaper/`
- **Unique Filenames**: Timestamp + random number + original extension
- **Path Storage**: Database stores relative paths from `src/public/`

### File Validation
- **Allowed Types**: JPEG, PNG, JPG, WEBP
- **Size Limit**: 5MB per file
- **File Count**: Maximum 2 files (image + wallpaper)

### Database Integration
- **Relative Paths**: Stored as `/public/uploads/station/image/filename.jpg` instead of full paths
- **Easy Access**: Frontend can access images via `/public/uploads/station/image/filename.jpg`

## Usage

### In Station Router
```typescript
import { stationUpload } from "@/common/middleware/stationUploadMiddleware";

// Create station with file uploads
stationRouter.post(
  "/",
  authenticate,
  permission,
  stationUpload.fields([
    { name: "image", maxCount: 1 },
    { name: "wallpaper", maxCount: 1 },
  ]),
  stationController.createStation
);

// Update station with file uploads
stationRouter.put(
  "/:id",
  authenticate,
  permission,
  stationUpload.fields([
    { name: "image", maxCount: 1 },
    { name: "wallpaper", maxCount: 1 },
  ]),
  stationController.updateStation
);
```

### In Station Controller
```typescript
// Handle uploaded files
const files = req.files as { [fieldname: string]: Express.Multer.File[] };

// Process image
if (files["image"] && files["image"][0]) {
  const imageFile = files["image"][0];
  image = `/public/uploads/station/image/${imageFile.filename}`;
}

// Process wallpaper
if (files["wallpaper"] && files["wallpaper"][0]) {
  const wallpaperFile = files["wallpaper"][0];
  wallpaper = `/public/uploads/station/wallpaper/${wallpaperFile.filename}`;
}
```

## File Path Examples

### Uploaded Files
- Full path: `src/public/uploads/station/image/1747384608724-821922357-station.jpg`
- Database path: `/public/uploads/station/image/1747384608724-821922357-station.jpg`
- Frontend URL: `/public/uploads/station/image/1747384608724-821922357-station.jpg`

### Wallpaper Files
- Full path: `src/public/uploads/station/wallpaper/1747384608740-890862994-background.jpg`
- Database path: `/public/uploads/station/wallpaper/1747384608740-890862994-background.jpg`
- Frontend URL: `/public/uploads/station/wallpaper/1747384608740-890862994-background.jpg`

## Error Handling
- **Invalid File Types**: Returns error "Chỉ chấp nhận file ảnh (JPEG, PNG, JPG, WEBP)"
- **File Size Exceeded**: Multer automatically handles 5MB limit
- **Too Many Files**: Multer automatically handles 2 file limit

## Security Considerations
- File type validation prevents malicious uploads
- Size limits prevent DoS attacks
- Unique filenames prevent conflicts
- Authentication required for uploads
