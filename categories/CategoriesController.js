const express=require("express")
const router=express.Router()
const Category=require("./Category")
const slugify=require("slugify")
const adminAuth=require("../middlewares/adminAuth")

router.get("/admin/categories",adminAuth,(req,res)=>{
  Category.findAll({
    order:[
      ['id','DESC']
    ]
  }).then(categories=>{
    res.render("admin/Categories/categories",{
      categories:categories
    })
  })
})

//Criação de categorias
router.get("/admin/category/new",adminAuth,(req,res)=>{
  res.render("admin/Categories/newCategory.ejs")
})
router.post("/admin/category/new/save",adminAuth,(req,res)=>{
  var title=req.body.title
  if(title.trim()!=''){
    Category.create({
      title:title,
      slug:slugify(title)
    }).then(()=>{
      res.redirect('/admin/categories')
    }).catch(()=>{
      res.redirect('/admin/category/new')
    })
  }else{
    res.redirect('/admin/category/new')
  }
})

//Edição de Categorias
router.get("/admin/category/edit/:id",adminAuth,(req,res)=>{
  var id=req.params.id
  if(isNaN(id)){
    res.redirect("/admin/categories")
  }else{
    Category.findOne({
      where:{
        id:id
      }
    }).then(category=>{
      if(category==undefined){
        res.redirect(`/admin/category/edit/:${id}`)
      }else{
        res.render("admin/Categories/editCategory",{
          category:category
        })
      }
    }).catch(()=>{
      res.redirect('/admin/categories')
    })
  }
})
router.post("/admin/category/edit/save",adminAuth,(req,res)=>{
  var title=req.body.title
  var id=req.body.id
  if(title.trim()!='' && id!=undefined && !isNaN(id)){
    Category.update({
      title:title,
      slug:slugify(title)
    },{
      where:{
        id:id
      }
    }).then(()=>{
      res.redirect("/admin/categories")
    }).catch(()=>{
      res.redirect(`/admin/category/edit/:${id}`)
    })
  }else{
    res.redirect("/admin/categories")
  }
})

//Exclusão de Categorias
router.post("/admin/category/delete/save",adminAuth,(req,res)=>{
  var id=req.body.id
  if(!isNaN(id)){
    Category.destroy({
      where:{
        id:id
      }
    }).then(()=>{
      res.redirect("/admin/categories")
    })
  }else{
    res.redirect("/admin/categories")
  }
})

module.exports=router