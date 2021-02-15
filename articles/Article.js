const Sequelize=require("sequelize")
const connection=require("../database/database")
const Category=require("../categories/Category")

const Article=connection.define("articles",{
  title:{
    type:Sequelize.STRING,
    allowNull:false
  },
  slug:{
    type:Sequelize.STRING,
    allowNull:false
  },
  body:{
    type:Sequelize.TEXT,
    allowNull:false
  }
})


//Expressa o relacionamento Article pertence a Category(Relacionamento um para um) 
Article.belongsTo(Category)
//Expressa o relacionamento Category tem muitos Article
Category.hasMany(Article)

Article.sync({force:false}).then(()=>{
  console.log("Tabela de artigos criada")
})

module.exports=Article