const List = require('../models/List');

exports.createList = async (req, res) => {
  const { name, codes, imageLinks } = req.body;
  try {
    const list = await List.create({
      userId: req.userId,
      name,
      codes,
      imageLinks,
    });
    res.status(201).json(list);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getLists = async (req, res) => {
  try {
    const lists = await List.find({ userId: req.userId }).sort({ createdAt: -1 });
    res.status(200).json(lists);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getList = async (req, res) => {
  try {
    const list = await List.findOne({ _id: req.params.id, userId: req.userId });
    if (!list) return res.status(404).json({ message: 'List not found' });
    res.status(200).json(list);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateList = async (req, res) => {
  const { name, codes, imageLinks } = req.body;
  try {
    const list = await List.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { name, codes, imageLinks },
      { new: true }
    );
    if (!list) return res.status(404).json({ message: 'List not found' });
    res.status(200).json(list);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.deleteList = async (req, res) => {
  try {
    const list = await List.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    if (!list) return res.status(404).json({ message: 'List not found' });
    res.status(200).json({ message: 'List deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
}; 