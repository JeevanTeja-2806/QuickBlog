import express from 'express'
import { addBlog, addComment, deleteBlogById, getAllBlogs, getBlogById, getAllComments, togglePublish, generateContent } from '../controllers/blogController.js'
import upload from '../middlewares/multer.js'
import auth from '../middlewares/auth.js'

const blogRouter = express.Router()

blogRouter.post("/add", upload.single('image'), auth, addBlog)
blogRouter.get("/all", getAllBlogs)
blogRouter.post("/generate", auth, generateContent)
blogRouter.post("/delete", auth, deleteBlogById)
blogRouter.post('/toggle-publish', auth, togglePublish)
blogRouter.post('/add-comments', addComment)
blogRouter.post('/comments', getAllComments)
blogRouter.get("/:blogId", getBlogById)



export default blogRouter
