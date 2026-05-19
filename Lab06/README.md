# Lab06 (Xây dựng Frontend với ReactJS - tiếp theo)

## 1. Thông tin sinh viên

| Họ tên                   | MSSV               | Lớp                |
| :------------------------- | :----------------- | :------------------ |
| **Ngô Văn Thịnh** | **23521500** | **IE213.Q21** |

## 2. Thông tin môn học

- Môn học: **IE213.Q21 - Kỹ thuật phát triển hệ thống web**

## 3. Danh sách lab

- **Lab06: Xây dựng Frontend với ReactJS (tt)**

## 4. Mô tả ngắn gọn Lab06

Lab06 kế thừa project **Movie Reviews** từ Lab05 và hoàn thiện thêm các luồng thao tác review trên frontend. Ứng dụng cho phép đăng nhập giả lập, thêm review, sửa review của chính người dùng, xóa review của chính người dùng, lấy danh sách phim theo trang và giữ đúng phân trang khi tìm kiếm theo `title` hoặc `rating`.

## 5. Cách chạy chương trình

1. Chạy backend:

```bash
cd Lab06/movie-reviews/backend
npm install
cp .env.example .env
```

2. Cấu hình file `.env`:

```env
MOVIEREVIEWS_DB_URI=<mongodb-atlas-uri>
MOVIEREVIEWS_NS=sample_mflix
PORT=3000
```

3. Khởi động backend:

```bash
npm run dev
```

4. Chạy frontend ở terminal khác:

```bash
cd Lab06/movie-reviews/frontend
npm install
PORT=3001 npm start
```

5. Mở trình duyệt:

- Frontend: `http://localhost:3001`
- Backend API: `http://localhost:3000/api/v1/movies`

Video demo: [https://drive.google.com/file/d/1FQUI8jLQZB6Q4o8nikT8oYsoMGMkqX1J/view?usp=sharing](https://drive.google.com/file/d/1FQUI8jLQZB6Q4o8nikT8oYsoMGMkqX1J/view?usp=sharing)

## 6. Chi tiết thực hiện theo từng câu

## Bài 1: Thêm và Sửa Review

### 1.1 Tạo login component

**Thực hiện:**

- Tạo component `login.js` để nhập `name` và `id`.
- `App.js` quản lý state `user`, lưu vào `localStorage` với key riêng cho Lab06.
- Sau khi đăng nhập thành công, người dùng được chuyển về route home hoặc route đang chờ từ `location.state.from`.
- Khi đã đăng nhập, trang chi tiết movie sẽ hiển thị nút thêm review, sửa và xóa review của chính user đó.

**Mã chính:**

```javascript
await login({
  name: name.trim(),
  id: id.trim(),
});

navigate(location.state?.from || "/", { replace: true });
```

**Kết quả:**

- Frontend mô phỏng được trạng thái đăng nhập đúng yêu cầu.
- Các chức năng thêm/sửa/xóa review chỉ hiển thị khi user phù hợp.

### 1.2 Thêm review

**Thực hiện:**

- Tạo component `add-review.js`.
- Dùng `useParams()` để lấy `movie_id` từ URL.
- Dùng state `review` để theo dõi nội dung nhập từ form.
- Khi submit, gọi `MovieDataService.createReview()` và gửi `movie_id`, `review`, `userinfo.name`, `userinfo.id` về backend.

**Mã chính:**

```javascript
await MovieDataService.createReview({
  movie_id: id,
  review: review.trim(),
  userinfo: {
    name: user.name,
    id: user.id,
  },
});
```

**Kết quả:**

- User đã đăng nhập có thể thêm review mới cho từng movie.
- Sau khi lưu thành công, frontend điều hướng về trang chi tiết movie.

### 1.3 Sửa review

**Thực hiện:**

- Trong `movie.js`, khi bấm nút sửa, truyền review hiện tại qua route state với thuộc tính `currentReview`.
- Trong `add-review.js`, nếu có `currentReview` thì bật chế độ editing và nạp nội dung review cũ vào form.
- Khi submit ở chế độ editing, gọi `MovieDataService.updateReview()`.

**Mã chính:**

```javascript
navigate(`/movies/${movie._id}/review`, {
  state: {
    currentReview: {
      ...review,
      review: review.text,
    },
  },
});
```

```javascript
await MovieDataService.updateReview({
  review_id: editingReview._id,
  user_id: user.id,
  review: review.trim(),
});
```

**Kết quả:**

- Người dùng chỉ sửa được review do chính mình tạo.
- Backend kiểm tra `review_id` và `user_id` trước khi cập nhật.

## Bài 2: Xóa review

**Thực hiện:**

- Trong `movie.js`, nút xóa truyền `review._id` và `index` của review trong mảng.
- Hàm `handleDelete()` gọi `MovieDataService.deleteReview(reviewId, user.id)`.
- Sau khi backend xóa thành công, frontend dùng `splice(index, 1)` trên bản sao mảng reviews rồi cập nhật lại state `movie`.

**Mã chính:**

```javascript
await MovieDataService.deleteReview(reviewId, user.id);

setMovie((currentMovie) => {
  const nextReviews = [...(currentMovie.reviews || [])];
  nextReviews.splice(reviewIndex, 1);
  return { ...currentMovie, reviews: nextReviews };
});
```

**Kết quả:**

- Review bị xóa khỏi MongoDB và biến mất khỏi giao diện ngay sau khi thao tác thành công.
- User không thể xóa review của người khác vì backend lọc theo `review_id` và `user_id`.

## Bài 3: Lấy dữ liệu cho trang tiếp theo

### 3.1 `getAll()`

**Thực hiện:**

- Trong `movies-list.js`, thêm các state `page` và `entriesPerPage`.
- `retrieveMovies(nextPage)` gọi `MovieDataService.getAll(nextPage, MOVIES_PER_PAGE)`.
- Frontend hiển thị trang hiện tại, tổng số trang và nút lấy trang kế tiếp.

**Mã chính:**

```javascript
const response = await MovieDataService.getAll(nextPage, MOVIES_PER_PAGE);
setMovies(response.data.movies || []);
setEntriesPerPage(response.data.entries_per_page || MOVIES_PER_PAGE);
setPage(response.data.page ?? nextPage);
```

**Kết quả:**

- Danh sách movie được lấy theo từng trang từ backend.
- Nút `Trang trước` và `Lấy ... phim tiếp theo` hoạt động theo `page`.

### 3.2 `find()`

**Thực hiện:**

- Thêm state `currentSearchMode` để ghi nhớ chế độ hiện tại: tất cả phim, tìm theo title hoặc tìm theo rating.
- Hàm `find(query, by, nextPage)` truyền `nextPage` vào `MovieDataService.find()`.
- Hàm `retrievePage(nextPage)` dựa vào `currentSearchMode` để chuyển trang đúng với bộ lọc đang dùng.

**Mã chính:**

```javascript
function retrievePage(nextPage) {
  if (currentSearchMode === SEARCH_MODE_TITLE && searchTitle.trim()) {
    find(searchTitle.trim(), "title", nextPage);
    return;
  }

  if (
    currentSearchMode === SEARCH_MODE_RATING &&
    searchRating !== ALL_RATINGS
  ) {
    find(searchRating, "rated", nextPage);
    return;
  }

  retrieveMovies(nextPage);
}
```

**Kết quả:**

- Khi đang tìm theo title, nút sang trang tiếp theo vẫn giữ điều kiện `title`.
- Khi đang lọc theo rating, nút sang trang tiếp theo vẫn giữ điều kiện `rated`.
- Khi không có bộ lọc, phân trang dùng danh sách tất cả movie.
