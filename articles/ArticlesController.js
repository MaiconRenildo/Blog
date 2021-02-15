const express=require("express")
const router=express.Router()
const slugify=require('slugify')

//Busca os models
const Article=require("./Article")
const Category=require("../categories/Category")
const adminAuth=require("../middlewares/adminAuth")

router.get("/admin/articles",adminAuth,(req,res)=>{
  Article.findAll({
    order:[
      ['id','DESC']
    ],
    include:[
      {model:Category}  //Incluo a Categoria para que eu possa pegar automaticamente a respectiva categoria do artigo
    ]
  }).then(articles=>{
    Category.findAll({
      order:[
        ['id','DESC']
      ]
    }).then(categories=>{
      res.render("admin/Articles/articles",{
        articles:articles,
        categories:categories
      })
    })
  })
})

//Criação de Artigo
router.get("/admin/article/new",adminAuth,(req,res)=>{
  Category.findAll({
    order:[
      ['id','DESC']
    ]
  }).then( categories=>{
    res.render("admin/Articles/newArticle",{
      categories:categories
    }).catch(()=>{
      res.redirect('/admin/articles')
    })
  }).catch(()=>{
    res.redirect('/admin/articles')
  })
})
router.post("/admin/article/new/save",adminAuth,(req,res)=>{
  var title=req.body.title
  var slug=slugify(title)
  var body=req.body.body
  var categoryId=req.body.category
  if(title.trim()!='' && !isNaN(categoryId)){
    Article.create({
      title,
      slug,
      body,
      categoryId
    }).then(()=>{
      res.redirect("/admin/articles")
    }).catch("/admin/articles/new")
  }else{
    res.redirect("/admin/articles/new")
  }
})

//Edição de Artigo
router.get("/admin/article/edit/:id",adminAuth,(req,res)=>{
  var id=req.params.id
  Article.findOne({
    where:{
      id:id
    }
  }).then(article=>{
    Category.findAll({
      order:[
        ['id','DESC']
      ]
    }).then(categories=>{
      res.render("admin/Articles/editArticle",{
        article:article,
        categories:categories
      })
    }).catch(()=>{
      res.redirect("/admin/articles")
    })
  }).catch(()=>{
    res.redirect('/admin/articles')
  })
})
router.post("/admin/article/edit/save",adminAuth,(req,res)=>{
  var id=req.body.id //
  var title=req.body.title
  var slug=slugify(title)
  var body=req.body.body
  var categoryId=req.body.category
  if(title.trim()!='' && !isNaN(id) && !isNaN(categoryId)){
    Article.update({
      id,
      title,
      slug,
      body,
      categoryId
    },{
      where:{
        id:id
      }
    }).then(()=>{
      res.redirect("/admin/articles")
    }).catch(()=>{
      res.redirect(`/admin/articles/edit/:${id}`)
    })
  }else{
    res.redirect(`/admin/articles/edit/:${id}`)
  }
})

//Exclusão de Artigo
router.post("/admin/article/delete/save",adminAuth,(req,res)=>{
  var id=req.body.id
  if(!isNaN(id)){
    Article.destroy({
      where:{
        id:id
      }
    }).then(()=>{
      res.redirect("/admin/articles")
    }).catch(()=>{
      res.redirect("/admin/articles")
    })
  }else{
    res.redirect('/admin/articles')
  }
})

module.exports=router