const db = require("../db/connection");

function getArticleData(article_id) {
  return db
    .query("SELECT articles.author, articles.title, articles.article_id, articles.topic, articles.created_at, articles.votes, articles.article_img_url, articles.body, COUNT(comments.article_id)::INT AS comment_count FROM articles LEFT JOIN comments ON comments.article_id = articles.article_id WHERE articles.article_id = $1 GROUP BY articles.article_id", [article_id])
    .then((article) => {
      const articleRow = article.rows[0];
      if (!articleRow) {
        return Promise.reject({
          status: 404,
          message: "Not found",
        });
      }
      return articleRow;
    });
}

function getAllArticlesByTopic(topic, sort_by = "created_at", order_by = "desc") {
  const validSortBys = ["author", "title", "article_id", "topic", "created_at", "votes", "article_img_url", "comment_count"]
  const validOrderBys = ["asc", "desc"]
  if (!validSortBys.includes(sort_by) || !validOrderBys.includes(order_by)) {
    return Promise.reject({status: 400, message: "Bad request"})
  }
  if (/\d/.test(topic)) {
    return Promise.reject({
      status:400,
      message: "Bad request"
    })
  }
  return db
    .query(
      `SELECT articles.author, articles.title, articles.article_id, articles.topic, articles.created_at, articles.votes, articles.article_img_url, COUNT(comments.article_id)::INT AS comment_count FROM articles LEFT JOIN comments ON comments.article_id = articles.article_id WHERE topic = $1 GROUP BY articles.article_id ORDER BY ${sort_by} ${order_by}`,
      [topic]
    )
    .then((articles) => {
      const articlesRows = articles.rows
      if (articlesRows.length === 0) {
        return Promise.reject({
          status: 404,
          message: "Not found"
        })
      } else {
        return articlesRows;
      }
    });
}

function getAllArticlesData(sort_by = "created_at", order_by = "desc") {
  const validSortBys = ["author", "title", "article_id", "topic", "created_at", "votes", "article_img_url", "comment_count"]
  const validOrderBys = ["asc", "desc"]
  if (!validSortBys.includes(sort_by) || !validOrderBys.includes(order_by)) {
    return Promise.reject({status: 400, message: "Bad request"})
  }
  return db
    .query(
      `SELECT articles.author, articles.title, articles.article_id, articles.topic, articles.created_at, articles.votes, articles.article_img_url, COUNT(comments.article_id)::INT AS comment_count FROM articles LEFT JOIN comments ON comments.article_id = articles.article_id GROUP BY articles.article_id ORDER BY ${sort_by} ${order_by}`)
    .then((result) => {
      return result.rows;
    });
}

function patchArticleData(article_id, inc_votes) {
  if (!inc_votes) {
    return Promise.reject({
      status: 400,
      message: "Bad request: property not modifiable",
    });
  }
  return db
    .query(
      `UPDATE articles SET votes = votes + $1 WHERE article_id = $2 RETURNING *`,
      [inc_votes, article_id]
    )
    .then((article) => {
      if (article.rows.length === 0) {
        return Promise.reject({ status: 404, message: "Not found" });
      }
      return article.rows[0];
    });
}


function postArticleData(article) {
  const {title, topic, author, body} = article
  if (!title | !topic | !author | !body) {
    return Promise.reject({status:400, message:"Bad request"})
  }
  return db.query(
    `INSERT INTO articles (title, topic, author, body)
     VALUES ($1, $2, $3, $4)
     RETURNING *, (SELECT COUNT(comments.article_id) FROM comments WHERE comments.article_id = articles.article_id)::INT AS comment_count`,
    [title, topic, author, body]
  ).then((article) => {
    return article.rows[0]
  })
}

function deleteArticleData(article_id) {
 
  return db.query("DELETE FROM comments WHERE article_id=$1 RETURNING *", [article_id]).then(() => {
    return db.query(
      "DELETE FROM articles WHERE article_id=$1 RETURNING *", [article_id]
    ).then((article) => {
      if (article.rows.length === 0) {
        return Promise.reject({status: 400, message: "Article not found"})
      }
    })
  })
  
}

module.exports = {
  getArticleData,
  getAllArticlesData,
  patchArticleData,
  getAllArticlesByTopic,
  postArticleData,
  deleteArticleData
};
