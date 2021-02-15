const express= require("express")
const app=express()
const Sequelize=require("sequelize")
const Category=require("./categories/Category")
const Article=require("./articles/Article")
const User=require("./Users/User")

const session=require("express-session")

//Habilita o gerenciamento de sessões na aplicação. A sessão pode ser acessada de forma global
app.use(session({
  secret:'qualquer-coisa',
  cookie:{
    maxAge: 21600000//6 horas
  }
}))

//Usa o BodyParser embutido do express
app.use(express.urlencoded({extended:false}))
app.use(express.json())

//Habilita o uso das rotas administrativas de artigo
const articlesController=require("./articles/ArticlesController")
app.use("/",articlesController)

//Habilita o uso das rotas adinistrativas de categorias
const categoriesController=require("./categories/CategoriesController")
app.use('/',categoriesController)

//Habilita o uso das rotas administrativas de usuarios
const usersController=require("./Users/UsersController")
app.use("/",usersController)

const connection=require("./database/database")
//Efetua a conexão com o banco de dados
connection
  .authenticate()
  .then(()=>{
    console.log("Conexão com o banco feita com sucesso")
  })
  .catch((msgErro)=>{
    console.log(msgErro)
  })

//Habilita o ejs como view engine
app.set("view engine",'ejs')

//Habilita o uso dos arquivos estáticos
app.use(express.static('public'))

// Home
app.get("/",(req,res)=>{
  Article.findAndCountAll({
    order:[
      ['id','DESC']
    ],
    limit:4
  }).then(articles=>{
    var result={
      articles:articles,
      page:1,
      offset:0
    }
    Category.findAll().then(categories=>{
      res.render('index',{
        result:result,
        categories:categories
      })
    })
  })
})
//Páginas seguintes
app.get("/page/:num?",(req,res)=>{
  var page=req.params.num
  var offset
  if(isNaN(page) || page<=1){
    offset=0
    page=1
    res.redirect("/")
  }else{

    offset=(parseInt(page)-1)*4
  }
  Article.findAndCountAll({
    order:[
      ['id','DESC']
    ],
    limit:4,
    offset:offset
  }).then(articles=>{
    if(articles.count<=offset){
      res.redirect("/")
    }else{
      var result={
        articles:articles,
        page,
        offset
      }
      Category.findAll().then(categories=>{
        res.render("index",{
          result:result,
          categories:categories
        })
      })
    }
  })
})

//Rota individual das categorias
app.get("/category/:slug/:num",(req,res)=>{
  var slug=req.params.slug
  var page=req.params.num
  var offset
  if(isNaN(page) || page<=1){
    offset=0
  }else{
    offset=(parseInt(page)-1)*4
  }
  Category.findOne({
    where:{
      slug:slug
    }
  }).then(category=>{
    var categoryId=category.id
    Article.findAndCountAll({
      where:{
        categoryId:categoryId
      },
      order:[
        ['id','DESC']
      ],
      limit:4,
      offset:offset
    }).then(articles=>{
      if(articles.rows==''){
        res.redirect("/")
      }else{
        if(articles.count<=offset){
          res.redirect(`/category/${slug}/1`)
        }else{
          var result={
            articles:articles,
            page:page,
            offset:offset,
            category:category
          }
          Category.findAll().then(categories=>{
            res.render("category",{
              result:result,
              categories:categories
            })
          }).catch(()=>{
            res.redirect("/")
          })
        }
      }
    }).catch(()=>{
      res.redirect("/")
    })
  }).catch(()=>{
    res.redirect("/")
  })
})

//Rota individual dos artigos
app.get("/article/:slug",(req,res)=>{
  var slug=req.params.slug
  Article.findOne({
    where:{
      slug:slug
    }
  }).then(article=>{
    Category.findAll({
      order:[
        ['id','DESC']
      ]
    }).then(categories=>{
        res.render("article",{
          article:article,
          categories:categories
        })
    })
  })
})

app.listen("8080",()=>{
  console.log("Servidor iniciado com sucesso")
})