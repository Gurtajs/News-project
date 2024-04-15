const { getArticleData } = require("../models/articles-models");

function getArticle(req, res, next) {
  const { article_id } = req.params;
  getArticleData(article_id).then((article) => {
    res.status(200).send({ article });
  }).catch(next)
}

module.exports = { getArticle };