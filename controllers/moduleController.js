
import { createModuleSchema, createRoleSchema, deleteModuleSchema, roleIdSchema, updateModuleSchema, updateRoleSchema } from "../validation/moduleValidation.js";
import { createModuleService, createRoleService, deleteModuleService, deleteRoleService, getModulesService, getRoleByIdService, getRolesService, updateModuleService, updatePermissionService, updateRoleService, getBlogServices, getNewsServices, createRoleServiceTest, updateBlogServices, deleteBlogServices, addBlogServices, updateNewsServices, deleteNewsServices, addNewsServices, getAllRolesService  } from "../services/module.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiError.js";
import { statusCode } from "../config/config.js";
import { blogSchema, deleteBlogSchema, updateBlogSchema } from "../validation/blogValidation.js";
import { deleteNewsSchema, newsSchema, updateNewsSchema } from "../validation/newsValidation.js";


export const createModule = asyncHandler(async (req, res) => {
  const { error } = createModuleSchema.validate(req.body);
  if (error) {
    throw new apiError(statusCode.USER_ERROR, error.details[0].message, error.details);
  }
  const userId = req.user?._id;
  const result = await createModuleService(req.body , userId);
  res.status(result.statusCode).json(result);
});

export const deleteModule = asyncHandler(async (req, res) => {

  
  const { error } = deleteModuleSchema.validate(req.body);
  if (error) {
    throw new apiError(statusCode.USER_ERROR, error.details[0].message, error.details);
  }
  console.log("req.body", req.body);
  
  const result = await deleteModuleService(req.body);
  res.status(result.statusCode).json(result);
});

export const updateModule = asyncHandler(async (req, res) => {
  const { error } = updateModuleSchema.validate(req.body);
  if (error) {
    throw new apiError(statusCode.USER_ERROR, error.details[0].message, error.details);
  }
  const result = await updateModuleService(req.body);
  res.status(result.statusCode).json(result);
});

export const getModules = asyncHandler(async (req, res) => {  
  const result = await getModulesService();
  res.status(result.statusCode).json(result);
});

export const createRole = asyncHandler(async (req, res) => {
  console.log("reqssss.body", req);
  const { error } = createRoleSchema.validate(req.body);
  if (error) {
    throw new apiError(statusCode.USER_ERROR, error.details[0].message, error.details);
  }
  
  
  const result = await createRoleService(req);
  res.status(result.statusCode).json(result);
});


//test
export const createRoleTest = asyncHandler(async (req, res) => {
  const { error } = createRoleSchema.validate(req.body);
  if (error) {
    throw new apiError(statusCode.USER_ERROR, error.details[0].message, error.details);
  }
  const result = await createRoleServiceTest(req);
  res.status(result.statusCode).json(result);
});

export const deleteRole = asyncHandler(async (req, res) => {
  const { _id } = req.body;
  const result = await deleteRoleService(_id);
  res.status(result.statusCode).json(result);
});


export const getRoles = asyncHandler(async (req, res) => {
  const result = await getRolesService(req);
  res.status(result.statusCode).json(result);
});

export const getAllRoles = asyncHandler(async (req, res) => {
  const result = await getAllRolesService(req);
  res.status(result.statusCode).json(result);
});

export const updateRole = asyncHandler(async (req, res) => {
  const { error } = updateRoleSchema.validate(req.body);
  if (error) {
    throw new apiError(statusCode.USER_ERROR, error.details[0].message, error.details);
  }
  const result = await updateRoleService(req.body);
  res.status(result.statusCode).json(result);
});

export const updatePermission = asyncHandler(async (req, res) => {
  const result = await updatePermissionService(req.body);
  res.status(result.statusCode).json(result);
})

export const getRoleByID = asyncHandler(async (req, res) => {
  const { error } = roleIdSchema.validate(req.body);
  if (error) {
    throw new apiError(statusCode.USER_ERROR, error.details[0].message, error.details);
  }
  const result = await getRoleByIdService(req.body);
  res.status(result.statusCode).json(result);
})

export const getLoginRole = asyncHandler(async (req, res) => {
  const result = await getRoleByIdService(req.user.role);
  res.status(result.statusCode).json(result);
})

//get blog 
export const getBlog = asyncHandler(async (req, res) => {
  const blog = await getBlogServices();
  res.status(blog.statusCode).json(blog);
});

//add blog
export const addBlog = async (req, res, next) => {
  try {
   

    const { error } = blogSchema.validate(req.body);
    if (error) {
      throw new apiError(statusCode.USER_ERROR, error.details[0].message, error.details);
    }
    const blogData = {
      ...req.body,
      createdBy: req.user._id
    };
    const response = await addBlogServices(blogData);

    res.status(response.statusCode).json(response);
  } catch (error) {
    next(error);
  }
};

//update blog
export const updateBlog = async (req, res, next) => {
  try {
    // Validate request body
    const { error } = updateBlogSchema.validate(req.body);
    if (error) {
      throw new apiError(statusCode.USER_ERROR, error.details[0].message, error.details);
    }

    const blogData = req.body;
    const response = await updateBlogServices(blogData);

    console.log("res", response);
    res.status(response.statusCode).json(response);
  } catch (error) {
    next(error);
  }
};

//delete blog
export const deleteBlog = async (req, res, next) => {
  try {
    const { error } = deleteBlogSchema.validate(req.body);
    if (error) {
      throw new apiError(statusCode.USER_ERROR, error.details[0].message, error.details);
    }
    const { _id } = req.body;

    const response = await deleteBlogServices(_id);
    res.status(response.statusCode).json(response);
  } catch (error) {
    next(error);
  }
};

// Get all news
export const getNews = asyncHandler(async (req, res) => {
  const news = await getNewsServices();
  res.status(news.statusCode).json(news);
});

// Add news
export const addNews = async (req, res, next) => {
  try {
    const { error } = newsSchema.validate(req.body);
    if (error) {
      throw new apiError(statusCode.USER_ERROR, error.details[0].message, error.details);
    }   
    const newsData = {
      ...req.body,
      createdBy: req.user._id,
    };
    const response = await addNewsServices(newsData);

    res.status(response.statusCode).json(response);
  } catch (error) {
    next(error);
  }
};

// Update news
export const updateNews = async (req, res, next) => {
  try {
    const { error } = updateNewsSchema.validate(req.body);
    if (error) {
      throw new apiError(statusCode.USER_ERROR, error.details[0].message, error.details);
    }

    const newsData = req.body;
    const response = await updateNewsServices(newsData);

    res.status(response.statusCode).json(response);
  } catch (error) {
    next(error);
  }
};

// Delete news
export const deleteNews = async (req, res, next) => {
  try {
    const { error } = deleteNewsSchema.validate(req.body);
    if (error) {
      throw new apiError(statusCode.USER_ERROR, error.details[0].message, error.details);
    }

    const { _id } = req.body;
    const currentUserId = req.user._id; 
    const response = await deleteNewsServices(_id , currentUserId);

    res.status(response.statusCode).json(response);
  } catch (error) {
    next(error);
  }
};
