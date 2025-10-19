// 변수 선언
let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;
let movies = JSON.parse(localStorage.getItem('movies')) || [];
let ratings = JSON.parse(localStorage.getItem('ratings')) || [];
let trailers = JSON.parse(localStorage.getItem('trailers')) || [];
let users = JSON.parse(localStorage.getItem('users')) || [];
let currentRatingMovieId = null;

const GENRES = ['액션', '범죄', '사극', '코미디', '슬랩스틱', '로맨스', '스릴러', '공포', '전쟁', '스포츠', '판타지', '뮤지컬', '멜로', '단편', '장편', '컬트', '교육', '실험', 'B급', '패러디', '저예산', '독립', '애니메이션'];

// 변수 타입 확인
if (!Array.isArray(trailers)) trailers = [];
if (!Array.isArray(movies)) movies = [];
if (!Array.isArray(ratings)) ratings = [];
if (!Array.isArray(users)) users = [];

// 초기화
document.addEventListener('DOMContentLoaded', function() {
    try {
        updateUI();
        loadMovies();
        setupEventListeners();
        initRatingStars();
    } catch (error) {
        console.error('초기화 오류:', error);
    }
});

// 이벤트 리스너 설정
function setupEventListeners() {
    const loginBtn = document.getElementById('loginBtn');
    const signupBtn = document.getElementById('signupBtn');
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    const addMovieForm = document.getElementById('addMovieForm');
    const editMovieForm = document.getElementById('editMovieForm');
    const addTrailerForm = document.getElementById('addTrailerForm');
    const searchBtn = document.getElementById('searchBtn');
    const ratingForm = document.getElementById('ratingForm');
    const movieCategory = document.getElementById('movieCategory');
    const editMovieCategory = document.getElementById('editMovieCategory');
    const searchInput = document.getElementById('searchInput');

    if (loginBtn) loginBtn.addEventListener('click', () => openModal('loginModal'));
    if (signupBtn) signupBtn.addEventListener('click', () => openModal('signupModal'));
    if (loginForm) loginForm.addEventListener('submit', handleLogin);
    if (signupForm) signupForm.addEventListener('submit', handleSignup);
    if (addMovieForm) addMovieForm.addEventListener('submit', handleAddMovie);
    if (editMovieForm) editMovieForm.addEventListener('submit', handleEditMovie);
    if (addTrailerForm) addTrailerForm.addEventListener('submit', handleAddTrailer);
    if (searchBtn) searchBtn.addEventListener('click', handleSearch);
    if (ratingForm) ratingForm.addEventListener('submit', handleSubmitRating);
    
    if (movieCategory) {
        movieCategory.addEventListener('change', function() {
            const releaseDateGroup = document.getElementById('releaseDateGroup');
            releaseDateGroup.style.display = this.value === 'coming' ? 'block' : 'none';
        });
    }

    if (editMovieCategory) {
        editMovieCategory.addEventListener('change', function() {
            const editReleaseDateGroup = document.getElementById('editReleaseDateGroup');
            editReleaseDateGroup.style.display = this.value === 'coming' ? 'block' : 'none';
        });
    }

    if (searchInput) {
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') handleSearch();
        });
    }

    document.addEventListener('click', function(e) {
        if (e.target.classList && e.target.classList.contains('modal')) {
            e.target.classList.remove('active');
        }
    });
}

// UI 업데이트
function updateUI() {
    const mainContent = document.getElementById('mainContent');
    const loginAlert = document.getElementById('loginAlert');
    const authButtonsDiv = document.querySelector('.auth-buttons');

    if (currentUser) {
        mainContent.classList.remove('content-hidden');
        mainContent.classList.add('content-visible');
        loginAlert.style.display = 'none';
        
        authButtonsDiv.innerHTML = `
            <div class="user-info active">${currentUser.name}님 환영합니다</div>
            <button onclick="handleLogout()">로그아웃</button>
        `;
    } else {
        mainContent.classList.add('content-hidden');
        mainContent.classList.remove('content-visible');
        loginAlert.style.display = 'flex';
        
        authButtonsDiv.innerHTML = `
            <button id="loginBtn">로그인</button>
            <button id="signupBtn">회원가입</button>
        `;
        
        setupEventListeners();
    }
}

// 로그인
function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    
    const user = users.find(u => u.email === email && u.password === password);
    
    if (user) {
        currentUser = JSON.parse(JSON.stringify(user));
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        closeModal('loginModal');
        document.getElementById('loginForm').reset();
        updateUI();
        loadMovies();
        alert('로그인 성공!');
    } else {
        alert('이메일 또는 비밀번호가 잘못되었습니다.');
    }
}

// 회원가입 유효성 검사
function validateSignup(email, password, passwordConfirm) {
    if (!email.includes('@') || !email.includes('gmail.com')) {
        alert('이메일에 @와 gmail.com이 포함되어야 합니다.');
        return false;
    }

    const hasNumber = /[0-9]/.test(password);
    const hasUpperCase = /[A-Z]/.test(password);
    const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);

    if (!hasNumber) {
        alert('비밀번호에 숫자가 1개 이상 포함되어야 합니다.');
        return false;
    }
    if (!hasUpperCase) {
        alert('비밀번호에 대문자가 1개 이상 포함되어야 합니다.');
        return false;
    }
    if (!hasSpecial) {
        alert('비밀번호에 특수기호가 1개 이상 포함되어야 합니다.');
        return false;
    }

    if (password !== passwordConfirm) {
        alert('비밀번호가 일치하지 않습니다.');
        return false;
    }

    return true;
}

// 회원가입
function handleSignup(e) {
    e.preventDefault();
    const name = document.getElementById('signupName').value.trim();
    const studentId = document.getElementById('signupStudentId').value.trim();
    const email = document.getElementById('signupEmail').value.trim();
    const phone = document.getElementById('signupPhone').value.trim();
    const password = document.getElementById('signupPassword').value;
    const passwordConfirm = document.getElementById('signupPasswordConfirm').value;
    
    if (!validateSignup(email, password, passwordConfirm)) return;
    
    if (users.find(u => u.email === email)) {
        alert('이미 가입된 이메일입니다.');
        return;
    }
    
    users.push({
        id: Date.now(),
        name, studentId, email, phone, password
    });
    
    localStorage.setItem('users', JSON.stringify(users));
    closeModal('signupModal');
    document.getElementById('signupForm').reset();
    alert('회원가입 성공! 로그인해주세요.');
}

// 로그아웃
function handleLogout() {
    currentUser = null;
    localStorage.removeItem('currentUser');
    updateUI();
}

// 영화 추가
function handleAddMovie(e) {
    e.preventDefault();
    
    if (!currentUser) {
        alert('로그인이 필요합니다.');
        return;
    }

    const genreCheckboxes = document.querySelectorAll('input[name="genre"]:checked');
    const genres = Array.from(genreCheckboxes).map(cb => cb.value);
    
    if (genres.length === 0) {
        alert('최소 1개 이상의 장르를 선택해주세요.');
        return;
    }
    
    const movie = {
        id: Date.now(),
        name: document.getElementById('movieName').value.trim(),
        year: document.getElementById('movieYear').value,
        category: document.getElementById('movieCategory').value,
        genres: genres,
        director: document.getElementById('movieDirector').value.trim(),
        country: document.getElementById('movieCountry').value.trim(),
        runtime: document.getElementById('movieRuntime').value,
        rating: document.getElementById('movieRating').value,
        releaseDate: document.getElementById('movieReleaseDate').value || null,
        description: document.getElementById('movieDescription').value.trim(),
        trailer: document.getElementById('movieTrailer').value.trim(),
        poster: document.getElementById('moviePoster').value.trim(),
        photos: document.getElementById('moviePhotos').value.trim(),
        userId: currentUser.id
    };
    
    movies.push(movie);
    localStorage.setItem('movies', JSON.stringify(movies));
    closeModal('addMovieModal');
    document.getElementById('addMovieForm').reset();
    document.getElementById('releaseDateGroup').style.display = 'none';
    loadMovies();
    alert('영화가 추가되었습니다.');
}

// 영화 수정
function handleEditMovie(e) {
    e.preventDefault();
    
    const movieId = parseInt(document.getElementById('editMovieId').value);
    const movie = movies.find(m => m.id === movieId);
    
    if (!movie) return;

    const genreCheckboxes = document.querySelectorAll('#editGenreGroup input[type="checkbox"]:checked');
    const genres = Array.from(genreCheckboxes).map(cb => cb.value);
    
    movie.name = document.getElementById('editMovieName').value.trim();
    movie.year = document.getElementById('editMovieYear').value;
    movie.category = document.getElementById('editMovieCategory').value;
    movie.genres = genres;
    movie.director = document.getElementById('editMovieDirector').value.trim();
    movie.country = document.getElementById('editMovieCountry').value.trim();
    movie.runtime = document.getElementById('editMovieRuntime').value;
    movie.rating = document.getElementById('editMovieRating').value;
    movie.releaseDate = document.getElementById('editMovieReleaseDate').value || null;
    movie.description = document.getElementById('editMovieDescription').value.trim();
    movie.trailer = document.getElementById('editMovieTrailer').value.trim();
    movie.poster = document.getElementById('editMoviePoster').value.trim();
    movie.photos = document.getElementById('editMoviePhotos').value.trim();
    
    localStorage.setItem('movies', JSON.stringify(movies));
    closeModal('editMovieModal');
    loadMovies();
    alert('영화 정보가 수정되었습니다.');
}

// 영화 삭제
function deleteMovie(movieId) {
    if (!currentUser) {
        alert('로그인이 필요합니다.');
        return;
    }

    const movie = movies.find(m => m.id === movieId);
    
    if (movie && movie.userId === currentUser.id) {
        if (confirm('정말 삭제하시겠습니까?')) {
            movies = movies.filter(m => m.id !== movieId);
            localStorage.setItem('movies', JSON.stringify(movies));
            loadMovies();
            alert('영화가 삭제되었습니다.');
        }
    } else {
        alert('자신이 추가한 영화만 삭제할 수 있습니다.');
    }
}

// 영화 수정 폼 열기
function openEditModal(movieId) {
    if (!currentUser) {
        alert('로그인이 필요합니다.');
        return;
    }

    const movie = movies.find(m => m.id === movieId);
    
    if (!movie || movie.userId !== currentUser.id) {
        alert('자신이 추가한 영화만 수정할 수 있습니다.');
        return;
    }
    
    document.getElementById('editMovieId').value = movie.id;
    document.getElementById('editMovieName').value = movie.name;
    document.getElementById('editMovieYear').value = movie.year;
    document.getElementById('editMovieCategory').value = movie.category;
    document.getElementById('editMovieDirector').value = movie.director;
    document.getElementById('editMovieCountry').value = movie.country;
    document.getElementById('editMovieRuntime').value = movie.runtime;
    document.getElementById('editMovieRating').value = movie.rating;
    document.getElementById('editMovieDescription').value = movie.description;
    document.getElementById('editMovieTrailer').value = movie.trailer || '';
    document.getElementById('editMoviePoster').value = movie.poster || '';
    document.getElementById('editMoviePhotos').value = movie.photos || '';
    
    // 장르 체크박스 설정
    const editGenreGroup = document.getElementById('editGenreGroup');
    editGenreGroup.innerHTML = '';
    GENRES.forEach(genre => {
        const label = document.createElement('label');
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.value = genre;
        checkbox.checked = movie.genres && movie.genres.includes(genre);
        label.appendChild(checkbox);
        label.appendChild(document.createTextNode(genre));
        editGenreGroup.appendChild(label);
    });
    
    const editReleaseDateGroup = document.getElementById('editReleaseDateGroup');
    if (movie.category === 'coming') {
        editReleaseDateGroup.style.display = 'block';
        document.getElementById('editMovieReleaseDate').value = movie.releaseDate || '';
    } else {
        editReleaseDateGroup.style.display = 'none';
    }
    
    openModal('editMovieModal');
}

// D-Day 계산
function calculateDDay(releaseDate) {
    if (!releaseDate) return '';
    
    const release = new Date(releaseDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    release.setHours(0, 0, 0, 0);
    
    const diff = Math.ceil((release - today) / (1000 * 60 * 60 * 24));
    
    if (diff > 0) return `D-${diff}`;
    else if (diff === 0) return 'D-DAY';
    else return `D+${Math.abs(diff)}`;
}

// 영화 로드
function loadMovies() {
    const hotMovies = movies.filter(m => m.category === 'hot').slice(0, 4);
    const topMovies = movies.filter(m => m.category === 'top')
        .sort((a, b) => getAverageRating(b.id) - getAverageRating(a.id))
        .slice(0, 4);
    const comingMovies = movies.filter(m => m.category === 'coming').slice(0, 4);
    
    renderMovies('hotMovies', hotMovies);
    renderMovies('topMovies', topMovies);
    renderMovies('comingMovies', comingMovies);
}

// 영화 렌더링
function renderMovies(containerId, movieList) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    container.innerHTML = '';
    
    if (movieList.length === 0) {
        container.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #999;">영화가 없습니다.</p>';
        return;
    }
    
    movieList.forEach(movie => {
        const avgRating = getAverageRating(movie.id);
        const dday = movie.releaseDate ? calculateDDay(movie.releaseDate) : '';
        const card = document.createElement('div');
        card.className = 'movie-card';
        
        let dDayHtml = dday ? `<div class="movie-dday">${dday}</div>` : '';
        
        card.innerHTML = `
            <div class="movie-poster">
                ${movie.poster ? `<img src="${movie.poster}" alt="${movie.name}" onerror="this.src='https://via.placeholder.com/200x250?text=No+Image'">` : '<div style="display:flex;align-items:center;justify-content:center;width:100%;height:100%;">포스터 없음</div>'}
            </div>
            <div class="movie-info">
                <div class="movie-title" title="${movie.name}">${movie.name}</div>
                <div class="movie-rating">⭐ ${avgRating.toFixed(1)}</div>
                <div class="movie-year">${movie.year}</div>
                ${dDayHtml}
                <div class="movie-actions">
                    <button class="btn-detail" onclick="showMovieDetail(${movie.id})">설명</button>
                    <button class="btn-edit" onclick="openEditModal(${movie.id})">수정</button>
                    <button class="btn-delete" onclick="deleteMovie(${movie.id})">삭제</button>
                </div>
            </div>
        `;
        container.appendChild(card);
    });
}

// 더보기 페이지
function openMorePage(category) {
    if (!currentUser) {
        alert('로그인이 필요합니다.');
        return;
    }

    const categoryNames = { 'hot': '🔥 HOT 한 영화', 'top': '⭐ TOP 영화', 'coming': '🎬 공개 예정작' };

    let movieList = movies.filter(m => m.category === category);
    if (category === 'top') {
        movieList.sort((a, b) => getAverageRating(b.id) - getAverageRating(a.id));
    }

    document.getElementById('morePageTitle').textContent = categoryNames[category];
    renderMorePageMovies(movieList);

    document.getElementById('mainContent').style.display = 'none';
    document.getElementById('morePage').classList.remove('content-hidden');
    document.getElementById('morePage').classList.add('content-visible');
}

// 더보기 페이지 렌더링
function renderMorePageMovies(movieList) {
    const container = document.getElementById('morePageGrid');
    if (!container) return;
    
    container.innerHTML = '';
    
    if (movieList.length === 0) {
        container.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #999;">영화가 없습니다.</p>';
        return;
    }
    
    movieList.forEach(movie => {
        const avgRating = getAverageRating(movie.id);
        const dday = movie.releaseDate ? calculateDDay(movie.releaseDate) : '';
        const card = document.createElement('div');
        card.className = 'movie-card';
        
        let dDayHtml = dday ? `<div class="movie-dday">${dday}</div>` : '';
        
        card.innerHTML = `
            <div class="movie-poster">
                ${movie.poster ? `<img src="${movie.poster}" alt="${movie.name}" onerror="this.src='https://via.placeholder.com/200x250?text=No+Image'">` : '<div style="display:flex;align-items:center;justify-content:center;width:100%;height:100%;">포스터 없음</div>'}
            </div>
            <div class="movie-info">
                <div class="movie-title" title="${movie.name}">${movie.name}</div>
                <div class="movie-rating">⭐ ${avgRating.toFixed(1)}</div>
                <div class="movie-year">${movie.year}</div>
                ${dDayHtml}
                <div class="movie-actions">
                    <button class="btn-detail" onclick="showMovieDetail(${movie.id})">설명</button>
                    <button class="btn-edit" onclick="openEditModal(${movie.id})">수정</button>
                    <button class="btn-delete" onclick="deleteMovie(${movie.id})">삭제</button>
                </div>
            </div>
        `;
        container.appendChild(card);
    });
}

// 더보기 페이지 닫기
function closeMorePage() {
    document.getElementById('morePage').classList.add('content-hidden');
    document.getElementById('morePage').classList.remove('content-visible');
    document.getElementById('mainContent').style.display = '';
}

// 평균 평점
function getAverageRating(movieId) {
    const movieRatings = ratings.filter(r => r.movieId === movieId);
    if (movieRatings.length === 0) return 0;
    return movieRatings.reduce((acc, r) => acc + r.rating, 0) / movieRatings.length;
}

// 평가 모달 열기
function openRatingModal(movieId) {
    if (!currentUser) {
        alert('로그인이 필요합니다.');
        return;
    }
    
    currentRatingMovieId = movieId;
    const movie = movies.find(m => m.id === movieId);
    
    if (!movie) {
        alert('영화를 찾을 수 없습니다.');
        return;
    }
    
    document.getElementById('ratingMovieInfo').innerHTML = `
        <h3>${movie.name}</h3>
        <p><strong>감독:</strong> ${movie.director}</p>
        <p><strong>제작 국가:</strong> ${movie.country}</p>
        <p><strong>러닝타임:</strong> ${movie.runtime}분</p>
        <p><strong>연령 등급:</strong> ${movie.rating}</p>
        <p><strong>장르:</strong> ${movie.genres ? movie.genres.join(', ') : ''}</p>
        <p><strong>설명:</strong> ${movie.description}</p>
    `;
    
    document.getElementById('selectedRating').value = 0;
    document.getElementById('ratingComment').value = '';
    updateRatingStars(0);
    
    openModal('ratingModal');
}

// 별점 초기화
function initRatingStars() {
    const container = document.getElementById('ratingStars');
    if (!container) return;
    
    container.innerHTML = '';
    for (let i = 1; i <= 5; i++) {
        const star = document.createElement('span');
        star.textContent = '★';
        star.setAttribute('data-value', i);
        star.addEventListener('click', function() {
            document.getElementById('selectedRating').value = i;
            updateRatingStars(i);
        });
        container.appendChild(star);
    }
}

// 별점 업데이트
function updateRatingStars(rating) {
    const stars = document.querySelectorAll('#ratingStars span');
    stars.forEach((star, index) => {
        star.classList.toggle('active', index < rating);
    });
}

// 평가 제출
function handleSubmitRating(e) {
    e.preventDefault();
    
    const rating = parseInt(document.getElementById('selectedRating').value);
    const comment = document.getElementById('ratingComment').value.trim();
    
    if (rating === 0) {
        alert('평점을 선택해주세요.');
        return;
    }

    ratings.push({
        id: Date.now(),
        movieId: currentRatingMovieId,
        userId: currentUser.id,
        userName: currentUser.name,
        rating,
        comment
    });
    
    localStorage.setItem('ratings', JSON.stringify(ratings));
    closeModal('ratingModal');
    loadMovies();
    alert('평가가 저장되었습니다.');
}

// 영화 상세 정보
function showMovieDetail(movieId) {
    const movie = movies.find(m => m.id === movieId);
    if (!movie) return;
    
    const movieRatings = ratings.filter(r => r.movieId === movieId);
    const avgRating = getAverageRating(movieId);
    
    let editDeleteButtons = '';
    if (currentUser && movie.userId === currentUser.id) {
        editDeleteButtons = `
            <div style="margin-top: 15px; display: flex; gap: 10px;">
                <button onclick="openEditModal(${movie.id}); closeModal('movieDetailModal');" class="btn-submit" style="flex: 1;">수정</button>
                <button onclick="deleteMovie(${movie.id}); closeModal('movieDetailModal');" class="btn-delete" style="flex: 1;">삭제</button>
            </div>
        `;
    }
    
    const detailHtml = `
        <div class="movie-detail">
            <div class="movie-detail-header">
                <div class="movie-detail-poster">
                    ${movie.poster ? `<img src="${movie.poster}" alt="${movie.name}" onerror="this.src='https://via.placeholder.com/250x350?text=No+Image'">` : '<div style="display:flex;align-items:center;justify-content:center;width:100%;height:100%;">포스터 없음</div>'}
                </div>
                <div class="movie-detail-info">
                    <h2>${movie.name}</h2>
                    <p><strong>출시년도:</strong> ${movie.year}</p>
                    <p><strong>감독:</strong> ${movie.director}</p>
                    <p><strong>제작 국가:</strong> ${movie.country}</p>
                    <p><strong>러닝타임:</strong> ${movie.runtime}분</p>
                    <p><strong>연령 등급:</strong> ${movie.rating}</p>
                    <p><strong>장르:</strong> ${movie.genres ? movie.genres.join(', ') : ''}</p>
                    <p><strong>평균 평점:</strong> ⭐ ${avgRating.toFixed(1)} (평가 ${movieRatings.length}개)</p>
                    <p><strong>설명:</strong></p>
                    <p>${movie.description}</p>
                    ${movie.trailer ? `<p><strong>예고편:</strong> <a href="${movie.trailer}" target="_blank" style="color: #dc143c;">보기</a></p>` : ''}
                    <button onclick="openRatingModal(${movie.id})" class="btn-submit" style="width: 100%; margin-top: 15px;">평가하기</button>
                    ${editDeleteButtons}
                </div>
            </div>
        </div>
    `;
    
    let reviewsHtml = '<div class="movie-reviews"><h3>평가 목록</h3>';
    
    if (movieRatings.length === 0) {
        reviewsHtml += '<p style="color: #999;">평가가 없습니다.</p>';
    } else {
        movieRatings.forEach(review => {
            reviewsHtml += `
                <div class="review-item">
                    <div class="review-header">
                        <span class="review-user">${review.userName}</span>
                        <span class="review-rating">⭐ ${review.rating}</span>
                    </div>
                    <div class="review-comment">${review.comment}</div>
                </div>
            `;
        });
    }
    reviewsHtml += '</div>';
    
    document.getElementById('movieDetail').innerHTML = detailHtml;
    document.getElementById('movieReviews').innerHTML = reviewsHtml;
    
    openModal('movieDetailModal');
}

// 검색
function handleSearch() {
    if (!currentUser) {
        alert('로그인이 필요합니다.');
        return;
    }

    const query = document.getElementById('searchInput').value.trim().toLowerCase();
    
    if (!query) {
        alert('검색어를 입력하세요.');
        return;
    }
    
    const searchResults = movies.filter(m => 
        m.name.toLowerCase().includes(query) ||
        m.director.toLowerCase().includes(query)
    );
    
    if (searchResults.length === 0) {
        alert('검색 결과가 없습니다.');
        return;
    }

    document.getElementById('morePageTitle').textContent = `검색 결과: "${query}"`;
    renderMorePageMovies(searchResults);

    document.getElementById('mainContent').style.display = 'none';
    document.getElementById('morePage').classList.remove('content-hidden');
    document.getElementById('morePage').classList.add('content-visible');
}

// 모달
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.add('active');
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.remove('active');
}