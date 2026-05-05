import React from "react";
import {
  Alert,
  Button,
  Card,
  Col,
  Form,
  Placeholder,
  Row,
} from "react-bootstrap";
import { Link } from "react-router-dom";
import MovieDataService from "../services/movies";

const ALL_RATINGS = "All Ratings";
const MOVIES_PER_PAGE = 12;

function formatMovieFacts(movie) {
  return [
    movie.rated ? `Rated ${movie.rated}` : null,
    movie.runtime ? `${movie.runtime} min` : null,
    movie.year ? `${movie.year}` : null,
  ].filter(Boolean);
}

function MoviePoster({ movie }) {
  if (movie.poster) {
    return (
      <div className="poster-shell">
        <img src={movie.poster} alt={movie.title} />
      </div>
    );
  }

  return (
    <div className="poster-shell">
      <div className="poster-fallback">{movie.title?.slice(0, 1) || "M"}</div>
    </div>
  );
}

export default function MoviesList({ user }) {
  const [movies, setMovies] = React.useState([]);
  const [ratings, setRatings] = React.useState([ALL_RATINGS]);
  const [searchTitle, setSearchTitle] = React.useState("");
  const [searchRating, setSearchRating] = React.useState(ALL_RATINGS);
  const [page, setPage] = React.useState(0);
  const [totalResults, setTotalResults] = React.useState(0);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");

  const retrieveMovies = React.useCallback(async (nextPage = 0) => {
    setLoading(true);
    setError("");

    try {
      const response = await MovieDataService.getAll(nextPage, MOVIES_PER_PAGE);
      setMovies(response.data.movies || []);
      setTotalResults(response.data.total_results || 0);
      setPage(nextPage);
    } catch (requestError) {
      setMovies([]);
      setTotalResults(0);
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const retrieveRatings = React.useCallback(async () => {
    try {
      const response = await MovieDataService.getRatings();
      setRatings([ALL_RATINGS, ...response.data.filter(Boolean).sort()]);
    } catch (requestError) {
      setError(requestError.message);
    }
  }, []);

  React.useEffect(() => {
    retrieveMovies();
    retrieveRatings();
  }, [retrieveMovies, retrieveRatings]);

  async function find(query, by) {
    setLoading(true);
    setError("");

    try {
      const response = await MovieDataService.find(
        query,
        by,
        0,
        MOVIES_PER_PAGE,
      );
      setMovies(response.data.movies || []);
      setTotalResults(response.data.total_results || 0);
      setPage(0);
    } catch (requestError) {
      setMovies([]);
      setTotalResults(0);
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }

  function findByTitle(event) {
    event.preventDefault();
    if (!searchTitle.trim()) {
      retrieveMovies(0);
      return;
    }

    find(searchTitle.trim(), "title");
  }

  function findByRating() {
    if (searchRating === ALL_RATINGS) {
      retrieveMovies(0);
      return;
    }

    find(searchRating, "rated");
  }

  function clearFilters() {
    setSearchTitle("");
    setSearchRating(ALL_RATINGS);
    retrieveMovies(0);
  }

  const totalPages = Math.max(1, Math.ceil(totalResults / MOVIES_PER_PAGE));

  return (
    <div className="stack-gap">
      <section className="section-hero">
        <span className="eyebrow">Lab05 React Frontend</span>
        <h1 className="page-title">Browse films and manage reviews from one UI.</h1>
        <p className="page-subtitle">
          Giao diện này kết nối trực tiếp tới backend Movie Reviews của các lab
          trước, gồm danh sách phim, chi tiết phim, thêm review và trạng thái
          đăng nhập giả lập cho người dùng.
        </p>
        <p className="page-subtitle mb-0">
          {user
            ? `Đang đăng nhập với user ${user.name} (${user.id}).`
            : "Bạn chưa đăng nhập. Có thể duyệt phim trước, sau đó đăng nhập để thêm review."}
        </p>
      </section>

      <Card className="filter-card border-0">
        <Card.Body className="p-4">
          <Form onSubmit={findByTitle}>
            <Row className="g-3 align-items-end">
              <Col md={6}>
                <Form.Group controlId="searchTitle">
                  <Form.Label>Tìm theo tên phim</Form.Label>
                  <Form.Control
                    type="text"
                    value={searchTitle}
                    onChange={(event) => setSearchTitle(event.target.value)}
                    placeholder="Nhập tiêu đề phim"
                  />
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group controlId="searchRating">
                  <Form.Label>Lọc theo rating</Form.Label>
                  <Form.Select
                    value={searchRating}
                    onChange={(event) => setSearchRating(event.target.value)}
                  >
                    {ratings.map((rating) => (
                      <option key={rating} value={rating}>
                        {rating}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={3} className="d-flex gap-2">
                <Button className="btn-accent flex-grow-1" type="submit">
                  Tìm theo title
                </Button>
                <Button
                  className="btn-outline-soft"
                  type="button"
                  onClick={findByRating}
                >
                  Tìm theo rating
                </Button>
                <Button
                  className="btn-outline-soft"
                  type="button"
                  onClick={clearFilters}
                >
                  Xóa lọc
                </Button>
              </Col>
            </Row>
          </Form>
        </Card.Body>
      </Card>

      {error ? <Alert variant="danger">{error}</Alert> : null}

      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2">
        <div className="muted-text">
          {loading
            ? "Đang tải danh sách phim..."
            : `Hiển thị ${movies.length} / ${totalResults} phim`}
        </div>
        <div className="muted-text">Trang {page + 1} / {totalPages}</div>
      </div>

      <Row className="g-4">
        {loading
          ? Array.from({ length: 6 }).map((_, index) => (
              <Col lg={4} md={6} key={index}>
                <Card className="movie-card border-0 h-100 p-3">
                  <Placeholder as="div" animation="glow">
                    <Placeholder xs={12} style={{ height: "280px" }} />
                  </Placeholder>
                  <Card.Body className="px-0 pb-0">
                    <Placeholder as="div" animation="glow">
                      <Placeholder xs={8} />
                      <Placeholder xs={5} />
                      <Placeholder xs={12} />
                      <Placeholder xs={10} />
                    </Placeholder>
                  </Card.Body>
                </Card>
              </Col>
            ))
          : movies.map((movie) => (
              <Col lg={4} md={6} key={movie._id}>
                <Card className="movie-card border-0 h-100 overflow-hidden">
                  <MoviePoster movie={movie} />
                  <Card.Body className="p-4 d-flex flex-column">
                    <div className="movie-meta mb-3">
                      {formatMovieFacts(movie).map((fact) => (
                        <span key={fact} className="movie-chip">
                          {fact}
                        </span>
                      ))}
                    </div>
                    <Card.Title className="fs-4">{movie.title}</Card.Title>
                    <Card.Text className="muted-text flex-grow-1">
                      {movie.plot
                        ? `${movie.plot.slice(0, 160)}${movie.plot.length > 160 ? "..." : ""}`
                        : "Chưa có mô tả cho bộ phim này."}
                    </Card.Text>
                    <div className="d-flex justify-content-between align-items-center gap-3 mt-3">
                      <div className="muted-text small">
                        IMDb {movie.imdb?.rating || "N/A"}
                      </div>
                      <Button
                        as={Link}
                        to={`/movies/${movie._id}`}
                        className="btn-accent"
                      >
                        Xem chi tiết
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
      </Row>

      {!loading && movies.length === 0 ? (
        <Alert variant="warning">Không tìm thấy phim phù hợp với bộ lọc hiện tại.</Alert>
      ) : null}

      <div className="d-flex justify-content-center gap-3 pt-2">
        <Button
          className="btn-outline-soft"
          disabled={page === 0 || loading}
          onClick={() => retrieveMovies(Math.max(page - 1, 0))}
        >
          Trang trước
        </Button>
        <Button
          className="btn-accent"
          disabled={loading || page + 1 >= totalPages}
          onClick={() => retrieveMovies(page + 1)}
        >
          Trang sau
        </Button>
      </div>
    </div>
  );
}
