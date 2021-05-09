const { nanoid } = require('nanoid');
const books = require('./books');

const addBookHandler = (request, h) => {
  const {
    name,
    year,
    author,
    summary,
    publisher,
    pageCount,
    readPage,
    reading,
  } = request.payload;

  const id = nanoid(16);
  const finished = pageCount === readPage;
  const insertedAt = new Date().toISOString();
  const updatedAt = insertedAt;

  const newBook = {
    name,
    year,
    author,
    summary,
    publisher,
    pageCount,
    readPage,
    reading,
    finished,
    id,
    insertedAt,
    updatedAt,
  };

  if (!name) {
    const response = h.response({
      status: 'fail',
      message: 'Gagal menambahkan buku. Mohon isi nama buku',
    });
    response.code(400);
    return response;
  }

  if (readPage > pageCount) {
    const response = h.response({
      status: 'fail',
      message: 'Gagal menambahkan buku. readPage tidak boleh lebih besar dari pageCount',
    });
    response.code(400);
    return response;
  }

  books.push(newBook);
  const isSuccess = books.filter((book) => book.id === id).length > 0;
  if (isSuccess) {
    const response = h.response({
      status: 'success',
      message: 'Buku berhasil ditambahkan',
      data: {
        bookId: id,
      },
    });
    response.code(201);
    return response;
  }

  const response = h.response({
    status: 'error',
    message: 'Buku gagal ditambahkan',
  });
  response.code(500);
  return response;
};

const getAllBooksHandler = (request, h) => {
  const { name, reading, finished } = request.query;
  let booksResult = [...books];

  if (name) {
    booksResult = booksResult.filter((n) => n.name.match(new RegExp(name, 'i')));
  }
  if (reading && !Number.isNaN(reading)) {
    const condition = Boolean(parseInt(reading, 10) > 0);
    booksResult = booksResult.filter((n) => n.reading === condition);
  }
  if (finished && !Number.isNaN(finished)) {
    const condition = Boolean(parseInt(finished, 10) > 0);
    booksResult = booksResult.filter((n) => n.finished === condition);
  }

  const debug = false;
  const response = h.response({
    status: 'success',
    data: {
      books: debug
        ? booksResult
        : booksResult.map((n) => ({
          id: n.id,
          name: n.name,
          publisher: n.publisher,
        })),
    },
  });
  response.code(200);
  return response;
};

const getBookByIdHandler = (request, h) => {
  const { id } = request.params;

  const book = books.filter((n) => n.id === id)[0];

  if (book !== undefined) {
    return {
      status: 'success',
      data: {
        book,
      },
    };
  }

  const response = h.response({
    status: 'fail',
    message: 'Buku tidak ditemukan',
  });
  response.code(404);
  return response;
};

const editBookByIdHandler = (request, h) => {
  const { id } = request.params;

  const {
    name, year, author, summary, publisher, pageCount, readPage, reading,
  } = request.payload;

  const updatedAt = new Date().toISOString();
  // eslint-disable-next-line no-unneeded-ternary
  const finished = (pageCount === readPage) ? true : false;
  const index = books.findIndex(((book) => book.id === id));

  if (readPage > pageCount) {
    const response = h.response(
      {
        status: 'fail',
        message: 'Gagal memperbarui buku. readPage tidak boleh lebih besar dari pageCount',
      },
    );
    response.code(400);
    return response;
  }

  if (name === undefined) {
    const response = h.response(
      {
        status: 'fail',
        message: 'Gagal memperbarui buku. Mohon isi nama buku',
      },
    );
    response.code(400);
    return response;
  }

  if (index !== -1) {
    books[index] = {
      ...books[index],
      name,
      publisher,
      year,
      author,
      summary,
      readPage,
      pageCount,
      reading,
      finished,
      updatedAt,
    };
    const response = h.response({
      status: 'success',
      message: 'Buku berhasil diperbarui',
    });
    response.code(200);
    return response;
  }
  const response = h.response({
    status: 'fail',
    message: 'Gagal memperbarui buku. Id tidak ditemukan',
  });
  response.code(404);
  return response;
};

const deleteBookByIdHandler = (request, h) => {
  const { id } = request.params;

  const index = books.findIndex(((book) => book.id === id));

  if (index !== -1) {
    books.splice(index, 1);
    const response = h.response({
      status: 'success',
      message: 'Buku berhasil dihapus',
    });
    response.code(200);
    return response;
  }

  const response = h.response({
    status: 'fail',
    message: 'Buku gagal dihapus. Id tidak ditemukan',
  });
  response.code(404);
  return response;
};

module.exports = {
  addBookHandler,
  getAllBooksHandler,
  getBookByIdHandler,
  editBookByIdHandler,
  deleteBookByIdHandler,
};
