const Post = require('../models/post');

exports.createdPost = (req, res, next) => {
  const url = req.protocol + "://" + req.get('host');
  const post = new Post({
    title: req.body.title,
    content: req.body.content,
    imagePath: url + '/images/' + req.file.filename,
    creator: req.userData.userId
  }); //constructor function given by the model created in mongoose && the body parameter in req is injected by body-parser
  post.save()
    .then(createdPost => {
      res.status(201).json({ //201 - typical status code for everything is ok and your resource is stored
        message: 'Post added successfully!',
        post: {
          ...createdPost,
          id: createdPost._id,
        }
      });
    }) //save method provided by mongoose to store the created model
    .catch(error => {
      res.status(500).json({
        message: 'Post creation failed!'
      })
    });
}

exports.updatePost = (req, res, next) => {
  let imagePath = req.body.imagePath;
  if (req.file) {
    const url = req.protocol + "://" + req.get('host');
    imagePath = url + '/images/' + req.file.filename
  }
  const post = new Post({
    _id: req.body.id,
    title: req.body.title,
    content: req.body.content,
    imagePath: imagePath,
    creator: req.userData.userId
  });
  Post.updateOne({ _id: req.params.id, creator: req.userData.userId }, post)
    .then(result => {
      if (result.n > 0) {
        res.status(200).json({ message: 'Post Updated Successfully' });
      } else {
        res.status(401).json({ message: 'Not Authorized' });
      }
    })
    .catch(err => {
      res.status(500).json({
        message: 'Post update failed!'
      })
    });
}


exports.getPosts = (req, res, next) => {
  const pageSize = +req.query.pagesize;
  const currentPage = +req.query.page; // Inorder to convert the incoming query string to number + is added infront of it.
  const postQuery = Post.find(); // query for gettin the matching element
  let fetchedPosts;
  if (pageSize && currentPage) {
    postQuery
      .skip(pageSize * (currentPage - 1)) // logic to skip the previous pages
      .limit(pageSize); // This mongoose query will still execute for all the entries in the DB, hence it seems inefficient for large dataset.
  }
  postQuery
    .then(documents => {
      fetchedPosts = documents; //Storing the document i.e) query results to a variable inorder to use in next then blog
      return Post.countDocuments(); // query for getting the total count of the posts irrespective query
    })
    .then(count => {
      res.status(200).json({
        message: 'Posts fetched successfully!',
        posts: fetchedPosts,
        maxPosts: count
      });
    })
    .catch(error => {
      res.status(500).json({
        message: 'Fetching post(s) failed!'
      })
    });
}

exports.getPost = (req, res, next) => {
  Post.findById(req.params.id)
    .then(post => {
      if (post) {
        res.status(200).json(post);
      } else {
        res.status(404).json({ message: 'No post found' })
      }
    })
    .catch(error => {
      res.status(500).json({
        message: 'Fetching post failed!'
      })
    });
}

exports.deletePost = (req, res, next) => {
  Post.deleteOne({ _id: req.params.id, creator: req.userData.userId })
    .then(result => {
      if (result.n > 0) {
        res.status(200).json({ message: 'Post deleted!' });
      } else {
        res.status(401).json({ message: 'Not Authorized' });
      }
    })
    .catch(() => {
      res.status(204).json({
        message: 'Post not deleted'
      });
    })
}
