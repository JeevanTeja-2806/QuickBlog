import fs from 'fs'
import imageKit from '../configs/imageKit.js'
import Blog from '../models/Blog.js'
import Comment from '../models/Comment.js'
import main from '../configs/gemini.js'

export const addBlog = async (req, res) => {
    try {
        const { title, subTitle, description, category, isPublished } = JSON.parse(req.body.blog)
        const imageFile = req.file;

        //Check if all fields are present
        if (!title || !description || !category || !imageFile) {
            return res.json({ success: false, message: "Missing required Fields" })
        }

        //Upload Image with ImageKit
        const fileBuffer = fs.readFileSync(imageFile.path)
        const response = await imageKit.upload({
            file: fileBuffer,
            fileName: imageFile.originalname,
            folder: "/blogs"
        })

        //Optimization through ImageKit URL transformation
        const optimizedImageURL = imageKit.url({
            path: response.filePath,
            transformation: [
                { quality: 'auto' }, //Auto Compression
                { format: 'webp' }, //Convert to modern Format
                { width: '1280' }  //Width resizing
            ]
        })

        const image = optimizedImageURL

        await Blog.create({ title, subTitle, description, category, image, isPublished })

        res.json({ success: true, message: "Blog added Successfully" })

    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}

export const getAllBlogs = async (req, res) => {
    try {
        const blogs = await Blog.find({ isPublished: true })
        res.json({ success: true, blogs })
    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}

export const getBlogById = async (req, res) => {
    try {
        const { blogId } = req.params

        if (!blogId) {
            return res.json({ success: false, message: "Blog ID is missing" })
        }

        const blog = await Blog.findById(blogId)

        if (!blog) {
            return res.json({ success: false, message: "Blog not found" })
        }

        res.json({ success: true, blog })
    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}

export const deleteBlogById = async (req, res) => {
    try {
        const { id } = req.body
        await Blog.findByIdAndDelete(id)

        //Delete all Comments associated with it
        await Comment.deleteMany({ blogId: id })

        return res.json({ success: true, message: "Blog Deleted Successfully" })

    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}

export const togglePublish = async (req, res) => {
    try {
        const { id } = req.body
        const blog = await Blog.findById(id)
        blog.isPublished = !blog.isPublished
        await blog.save()
        res.json({ success: true, message: "Blog status Updated" })
    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}

export const addComment = async (req, res) => {
    try {
        const { blogId, name, content } = req.body; // ✅ changed from `blog` to `blogId`
        await Comment.create({ blog: blogId, name, content }); // ✅ correctly mapped
        res.json({ success: true, message: "Comment Added for Review" });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}


export const getAllComments = async (req, res) => {
    try {
        const comments = await Comment.find().sort({ createdAt: -1 }).populate('blog');
        res.json({ success: true, comments });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}

export const generateContent = async (req,res) => {
    try {
        const {prompt} =req.body
        const content = await main(prompt + 'Generate a blog content for this topic in simple text format')
        res.json({success:true,content})
    }
    catch(error){
        res.json({success:false, message:error.message})
    }
}
