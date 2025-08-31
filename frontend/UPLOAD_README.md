# OpenLog Upload System

## Overview
A modern, drag-and-drop file upload system built with React, TypeScript, and Tailwind CSS. The system integrates with your backend upload API and provides a beautiful, consistent UI experience.

## Features

### 🎯 **Core Functionality**
- **Drag & Drop Upload**: Intuitive file selection with visual feedback
- **File Validation**: 4MB size limit, image/video format support
- **Progress Tracking**: Real-time upload progress with visual indicators
- **Smart Form**: Auto-fill project name from filename
- **Tag Management**: Add up to 20 custom tags for organization

### 🎨 **UI Components**
- **UploadModal**: Main upload interface component
- **Responsive Design**: Works on all screen sizes
- **Consistent Styling**: Matches your existing design system
- **Accessibility**: Proper labels, focus states, and keyboard navigation

### 🔒 **Security & Integration**
- **Authentication Required**: Only logged-in users can upload
- **Backend Integration**: Connects to your `/api/v1/upload` endpoint
- **File Type Validation**: Server-side and client-side validation
- **Token Management**: Automatic JWT token handling

## Usage

### 1. **Basic Upload Modal**
```tsx
import UploadModal from '@/components/upload/UploadModal';

function MyComponent() {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <UploadModal
      isOpen={isOpen}
      onClose={() => setIsOpen(false)}
      onUploadSuccess={(upload) => console.log('Success:', upload)}
    />
  );
}
```

### 2. **Dashboard Integration**
The upload modal is already integrated into your dashboard at `/dashboard`. Users can click the "Upload" button in the header.

### 3. **Demo Page**
Visit `/upload-demo` to see a complete example of the upload system in action.

## API Integration

### **Backend Endpoint**
```
POST /api/v1/upload
```

### **Required Fields**
- `file`: The uploaded file (image/video)
- `title`: Project name
- `description`: Optional description
- `owner_id`: User ID (auto-filled from auth)
- `visibility`: 'private', 'team', or 'public'

### **Response Format**
```json
{
  "success": true,
  "upload": {
    "id": "uuid",
    "title": "Project Name",
    "description": "Description",
    "file_path": "filename.jpg",
    "visibility": "private",
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```

## File Requirements

### **Supported Formats**
- **Images**: JPG, PNG, GIF, WebP, SVG
- **Videos**: MP4, MOV, AVI, WebM, MKV

### **Size Limits**
- **Maximum**: 4MB per file
- **Validation**: Both client and server-side

## Components

### **UploadModal.tsx**
Main upload component with:
- Drag & drop interface
- Form validation
- Progress tracking
- File preview
- Tag management

### **upload-demo/page.tsx**
Demo page showcasing:
- Upload functionality
- Recent uploads display
- Feature highlights
- Consistent UI design

## Styling

### **Design System**
- **Colors**: Gray scale with blue accents
- **Typography**: Consistent font weights and sizes
- **Spacing**: 4px grid system (Tailwind spacing)
- **Shadows**: Subtle shadows for depth
- **Borders**: Rounded corners and consistent borders

### **Responsive Breakpoints**
- **Mobile**: Single column layout
- **Tablet**: Two column grid
- **Desktop**: Three column grid with full modal

## Customization

### **Modifying Fields**
To add/remove form fields, edit the `UploadFormData` interface in `UploadModal.tsx`:

```tsx
interface UploadFormData {
  title: string;
  description: string;
  visibility: 'private' | 'public' | 'team';
  tags: string[];
  // Add your custom fields here
  category?: string;
  priority?: 'low' | 'medium' | 'high';
}
```

### **Changing Validation**
Modify the `handleFileSelect` function to change file validation rules:

```tsx
const handleFileSelect = (file: File) => {
  // Change size limit
  if (file.size > 10 * 1024 * 1024) { // 10MB
    alert('File size must be less than 10MB');
    return;
  }
  
  // Change file types
  const validTypes = ['image/', 'video/', 'application/pdf'];
  // ... rest of validation
};
```

### **Styling Updates**
All styling uses Tailwind CSS classes. To change colors, spacing, or layout, modify the className attributes in the components.

## Error Handling

### **Common Issues**
1. **File Too Large**: Shows alert with size limit
2. **Invalid File Type**: Shows alert with supported formats
3. **Upload Failure**: Shows error message from backend
4. **Authentication**: Redirects to login if not authenticated

### **Debugging**
- Check browser console for detailed error messages
- Verify backend API is running and accessible
- Ensure authentication tokens are valid
- Check file size and format requirements

## Future Enhancements

### **Planned Features**
- **Batch Upload**: Multiple file selection
- **Image Preview**: Thumbnail generation
- **Advanced Tags**: Auto-suggestions and categories
- **Upload History**: Track all user uploads
- **File Management**: Edit, delete, organize uploads

### **Integration Ideas**
- **Cloud Storage**: Direct upload to S3/MinIO
- **Image Processing**: Resize, compress, watermark
- **AI Analysis**: Content recognition and auto-tagging
- **Collaboration**: Share uploads with team members

## Support

For issues or questions:
1. Check the browser console for error messages
2. Verify your backend API is working correctly
3. Ensure all required environment variables are set
4. Check that authentication is properly configured

---

**Built with ❤️ using Next.js, React, TypeScript, and Tailwind CSS**
