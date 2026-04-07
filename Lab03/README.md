# Lab03 (Hoàn thiện Back-end cho ứng dụng Movie Reviews)

## 1. Thông tin sinh viên

| Họ tên            | MSSV         | Lớp           |
| :---------------- | :----------- | :------------ |
| **Ngô Văn Thịnh** | **23521500** | **IE213.Q21** |

## 2. Thông tin môn học

- Môn học: **IE213.Q21 - Kỹ thuật phát triển hệ thống web**

## 3. Danh sách lab

- **Lab03: Hoàn thiện back-end cho ứng dụng minh họa Movie Reviews**

## 4. Mô tả ngắn gọn Lab03

Lab03 mở rộng trực tiếp từ Lab02 để hoàn thiện backend Movie Reviews theo mô hình `route -> controller -> dao`, tập trung vào:
- CRUD review (`POST/PUT/DELETE`).
- Lấy chi tiết phim theo id kèm review.
- Lấy danh sách rating hiện có trong dữ liệu.

## 5. Cách chạy chương trình

1. Di chuyển vào thư mục backend của Lab03:

```bash
cd Lab03/movie-reviews/backend
```

2. Cài dependency:

```bash
npm install
```

3. Tạo file `.env` (nếu chưa có):

```env
MOVIEREVIEWS_DB_URI=<mongodb-atlas-uri>
MOVIEREVIEWS_NS=sample_mflix
PORT=3000
```

4. Chạy server ở chế độ dev:

```bash
npm run dev
```

5. Kiểm tra nhanh API:

- `http://localhost:3000/api/v1/movies`
- `http://localhost:3000/api/v1/movies/ratings`
- `http://localhost:3000/api/v1/movies/id/<movie_id>`

## 6. Chi tiết thực hiện theo từng bài

## Bài 1: Thiết lập định tuyến cho review

### 1.1 Định tuyến `/review`

**Thực hiện:**

- Trong `api/movies.route.js`, thêm route `/review` dưới prefix `/api/v1/movies`.

**Kết quả:**

- Đường dẫn đầy đủ: `localhost:3000/api/v1/movies/review`.

### 1.2 Thêm review bằng `POST`

**Thực hiện:**

- Ánh xạ `POST /review` tới `ReviewsController.apiPostReview`.

**Kết quả:**

- Hệ thống nhận yêu cầu thêm review từ client.

### 1.3 Cập nhật review bằng `PUT`

**Thực hiện:**

- Ánh xạ `PUT /review` tới `ReviewsController.apiUpdateReview`.

**Kết quả:**

- Hệ thống nhận yêu cầu sửa review từ client.

### 1.4 Xóa review bằng `DELETE`

**Thực hiện:**

- Ánh xạ `DELETE /review` tới `ReviewsController.apiDeleteReview`.

**Kết quả:**

- Hệ thống nhận yêu cầu xóa review từ client.

## Bài 2: Thiết lập Controller cho review

### 2.1 Tạo tệp `reviews.controller.js`

**Thực hiện:**

- Tạo class `ReviewsController` trong thư mục `api`.

**Kết quả:**

- Có controller chuyên xử lý yêu cầu review.

### 2.2 Import DAO

**Thực hiện:**

- Import `ReviewsDAO` từ `dao/reviewsDAO.js`.

**Kết quả:**

- Controller gọi được tầng truy xuất dữ liệu.

### 2.3 Tạo `apiPostReview()`

**Thực hiện:**

- Nhận dữ liệu từ `req.body`: `movie_id`, `review`, `userinfo.name`, `userinfo.id`.
- Tạo `date = new Date()`.
- Gọi `ReviewsDAO.addReview(...)`.
- Trả về JSON `{ status: "success" }` nếu thành công.

**Kết quả:**

- Thêm review mới vào collection `reviews`.

### 2.4 Tạo `apiUpdateReview()`

**Thực hiện:**

- Nhận `review_id`, `user_id`, `review` từ `req.body`.
- Tạo `date = new Date()`.
- Gọi `ReviewsDAO.updateReview(...)`.
- Dựa vào `modifiedCount` để xác định update thành công.

**Kết quả:**

- Chỉ user tạo review mới được phép cập nhật review đó.

### 2.5 Tạo `apiDeleteReview()`

**Thực hiện:**

- Nhận `review_id`, `user_id` từ `req.body`.
- Gọi `ReviewsDAO.deleteReview(...)`.
- Dựa vào `deletedCount` để xác định xóa thành công.

**Kết quả:**

- Chỉ user tạo review mới được phép xóa review đó.

## Bài 3: Thiết lập DAO cho reviews

### 3.1 Tạo `dao/reviewsDAO.js`

**Thực hiện:**

- Import `mongodb`, tạo `ObjectId`.
- Tạo biến `reviews` tham chiếu tới collection `reviews`.

**Kết quả:**

- Có tầng DAO cho nghiệp vụ review.

### 3.2 Tạo `injectDB()`

**Thực hiện:**

- Kết nối tới collection `reviews` qua `conn.db(...).collection("reviews")`.
- Gọi `ReviewsDAO.injectDB(client)` trong `index.js` sau khi connect DB.

**Kết quả:**

- Backend sẵn sàng thao tác với collection `reviews`.

### 3.3 Tạo `addReview()`

**Thực hiện:**

- Dùng `insertOne`.
- Chuyển `movieId` từ string sang `ObjectId`.

**Kết quả:**

- Lưu được review mới liên kết đúng với phim.

### 3.4 Tạo `updateReview()`

**Thực hiện:**

- Dùng `updateOne`.
- Chuyển `reviewId` sang `ObjectId`.
- Điều kiện update gồm cả `_id` và `user_id`.

**Kết quả:**

- Đảm bảo đúng user mới sửa được review.

### 3.5 Tạo `deleteReview()`

**Thực hiện:**

- Dùng `deleteOne`.
- Chuyển `reviewId` sang `ObjectId`.
- Điều kiện xóa gồm cả `_id` và `user_id`.

**Kết quả:**

- Đảm bảo đúng user mới xóa được review.

### 3.6 Thử nghiệm API review

**Mẫu request (Insomnia/Postman/cURL):**

```bash
curl -X POST http://localhost:3000/api/v1/movies/review \
  -H "Content-Type: application/json" \
  -d '{
    "movie_id": "<movie_id>",
    "review": "Great movie!",
    "userinfo": { "name": "Ngo Van Thinh", "id": "23521500" }
  }'
```

```bash
curl -X PUT http://localhost:3000/api/v1/movies/review \
  -H "Content-Type: application/json" \
  -d '{
    "review_id": "<review_id>",
    "user_id": "23521500",
    "review": "Updated review text"
  }'
```

```bash
curl -X DELETE http://localhost:3000/api/v1/movies/review \
  -H "Content-Type: application/json" \
  -d '{
    "review_id": "<review_id>",
    "user_id": "23521500"
  }'
```

## Bài 4: Hoàn thiện back-end cho ứng dụng minh họa

### 4.1 Thêm 2 định tuyến mới cho movies

**Thực hiện:**

- `GET /api/v1/movies/id/:id`: lấy thông tin phim + các review liên quan.
- `GET /api/v1/movies/ratings`: lấy danh sách tất cả loại rating.

**Kết quả:**

- Hoàn chỉnh nhóm API đọc dữ liệu nâng cao cho movie.

### 4.2 Thêm 2 phương thức controller trong `movies.controller.js`

**Thực hiện:**

- `apiGetMovieById()`.
- `apiGetRatings()`.

**Kết quả:**

- Controller xử lý đúng 2 route mới.

### 4.3 Thêm 2 phương thức DAO trong `moviesDAO.js`

**Thực hiện:**

- `getMovieById(id)`: dùng `aggregate()` với `$match` và `$lookup` để join với `reviews`.
- `getRatings()`: dùng `distinct("rated")`.

**Kết quả:**

- Trả được dữ liệu tổng hợp phim + review và danh sách rating.

### 4.4 Thử nghiệm các API mới

**Mẫu request:**

```bash
curl http://localhost:3000/api/v1/movies/ratings
```

```bash
curl http://localhost:3000/api/v1/movies/id/<movie_id>
```

## 7. Kết quả thực hiện tổng quan

- Hoàn thành mở rộng backend từ Lab02 sang Lab03 trong thư mục riêng `Lab03/movie-reviews`.
- Đã triển khai đầy đủ CRUD review theo yêu cầu đề.
- Đã triển khai API lấy movie theo id (kèm review) và API lấy ratings.
- Kiến trúc vẫn nhất quán theo mô hình `route -> controller -> dao`.
