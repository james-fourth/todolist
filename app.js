//Require modules
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

//Create server instance
const app = express();

//Use EJS and Body Parser
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-james:bootcampcluster@3429@cluster0-vyvcb.mongodb.net/todolistDB", {useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false})

//Initialize item schema and model
const itemsSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  }
})

const Item = mongoose.model("Item", itemsSchema);


const item1 = new Item({
  name: "Welcome to your todolist!"
});

const item2 = new Item({
  name: "Hit the + button to add a new item."
});

const item3 = new Item({
  name: "<-- Hit this to delete an item."
});

const defaultItems = [item1, item2, item3];

// item3.save();

//Initialize list schema and model
const listsSchema = new mongoose.Schema({
  name: String,
  items: [itemsSchema]
})

const List = mongoose.model("List", listsSchema);

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}
app.listen(port, function() { console.log("Server is listening on port 3000")});


app.get("/", function(req, res) {

  Item.find({}, function(err, foundItems) {

    if(foundItems.length === 0) {

      Item.insertMany(defaultItems, function(err) {
        if(err) {
          console.log(err);
        } else {
          console.log("Successfully saved items to DB");
        }
      });

      res.redirect("/");

    } else {

      res.render("list", {
        listTitle: "Today",
        newListItems: foundItems});
    }
  });

});

app.get("/:customListName", function(req, res) {
  const customListName = _.capitalize(req.params.customListName);

  List.findOne({name: customListName}, function(err, foundList) {
    if(!err) {
      if(!foundList) {
        const list = new List({
          name: customListName,
          items: defaultItems
        })
        list.save();
        res.redirect("/" + customListName);
      } else {
        res.render("list", {
          listTitle: foundList.name,
          newListItems: foundList.items
        })
      }
    }
  })
})

app.get("/about", function(req, res) {
  res.render("about")
});

app.post("/", function(req, res) {

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({name: itemName});

  if(listName === "Today") {
    item.save();
    res.redirect("/");
  } else {
    List.findOne({name: listName}, function(err, foundList) {
        foundList.items.push(item);
        // console.log(newList);
        // const list = new List({name: listName, items: newList});
        foundList.save();
        res.redirect("/" + listName);
    })
  }
})

app.post("/delete", function(req, res) {
  const checkedItem = req.body.checkbox;
  const listName = req.body.listName;

  if(listName === "Today") {
    Item.findByIdAndRemove(checkedItem, function(err, doc) {

    });
    res.redirect("/");
  } else {
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItem}}}, function(err, foundList) {
      res.redirect("/" + listName);
    })
  }
  //   List.findOne({name: listName}, function(err, foundList) {
  //     // console.log(foundList);
  //     foundList.items.pull({_id: checkedItem});
  //     foundList.save();
  //   })
  //   res.redirect("/" + listName)
  // }

})

app.post("/delete", function(req, res) {
  const checkedItem = req.body.checkbox;
  const listName = req.body.listName;
  List.findOne({name: listName}, function(err, foundList) {
    console.log(foundList);
    Item.findByIdAndRemove(checkedItem, function(err, doc) {
      // console.log(doc);
      foundList.save();
    })
  });
  res.redirect("/" + listName);
})
