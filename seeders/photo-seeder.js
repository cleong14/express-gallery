'use strict';

var faker = require('faker');

module.exports = {
  up: function (queryInterface, Sequelize) {
    for (var i = 0; i < 10; i++) {
      return queryInterface.bulkInsert('Galleries', [
      {
        author: faker.name.firstName(),
        link: faker.image.cats(),
        description: faker.lorem.sentences(),
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});
    }
  },

  down: function (queryInterface, Sequelize) {
    return queryInterface.bulkDelete('Galleries', null, {});
  }
};
