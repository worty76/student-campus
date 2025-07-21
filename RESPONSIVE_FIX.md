# Fix Responsive cho Màn Hình 16 Inch

## Vấn đề
- Trên màn hình 16 inch (thường 1366x768 hoặc 1920x1080), hai sidebar bị mất hoặc không hiển thị đúng
- Code cũ sử dụng breakpoint `lg` (1024px) nhưng tính toán vị trí fixed dựa trên giá trị cố định không phù hợp

## Giải pháp đã áp dụng

### 1. Thay đổi Breakpoints
- **Trước**: `hidden lg:block` (hiển thị từ 1024px)
- **Sau**: `hidden xl:block` (hiển thị từ 1280px)

### 2. Cải thiện Positioning cho Sidebar

#### Left Sidebar:
```css
/* Trước */
left-[calc((100vw-1280px)/2)] xl:left-[calc((100vw-1408px)/2)]

/* Sau */
left-2 xl:left-4 2xl:left-[calc((100vw-1280px)/2)]
```

#### Right Sidebar:
```css
/* Trước */
right-[calc((100vw-1280px)/2)] xl:right-[calc((100vw-1408px)/2)]

/* Sau */
right-2 xl:right-4 2xl:right-[calc((100vw-1280px)/2)]
```

### 3. Responsive Strategy mới

| Màn hình | Breakpoint | Left Sidebar | Right Sidebar | Center Content |
|----------|------------|--------------|---------------|----------------|
| < 1280px | sm, md, lg | Ẩn | Ẩn | Full width |
| 1280-1535px | xl | left-4 | right-4 | With sidebars |
| ≥ 1536px | 2xl | Tính toán trung tâm | Tính toán trung tâm | With sidebars |

## Lợi ích

1. **Màn hình 16 inch**: Sidebar không bị đẩy ra ngoài, hiển thị đúng vị trí
2. **Màn hình lớn hơn**: Vẫn giữ được layout trung tâm đẹp mắt
3. **Màn hình nhỏ hơn**: Sidebar ẩn hoàn toàn, tập trung vào nội dung chính
4. **Floating Action Button**: Hiển thị trên màn hình < 1280px để dễ dàng tạo bài viết

## Test Cases
- **1366x768**: ✅ Sidebar hiển thị với padding 16px từ cạnh
- **1920x1080**: ✅ Sidebar hiển thị với padding 16px từ cạnh  
- **1440x900**: ✅ Sidebar hiển thị với padding 16px từ cạnh
- **≥1536px**: ✅ Sidebar được tính toán trung tâm

## Floating Action Button
- Hiển thị trên màn hình < 1280px để người dùng vẫn có thể tạo bài viết dễ dàng
- Vị trí cố định ở góc dưới bên phải
