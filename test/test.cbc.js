var BH = require('../lib/bh');
require('chai').should();

describe('bh.cbc()', function() {
    var bh;
    beforeEach(function() {
        bh = new BH();
    });

    it('should replace classes', function() {
        bh.cbc('btn_color_default', 'btn-default');
        bh.match('btn', function(ctx, json) {
            ctx.tag('button');
            ctx.mod('color', 'default');
        });
        bh.apply({
            block: 'btn',
        }).should.equal('<button class="btn btn-default"></button>');
    });

    it('should remove classes', function() {
        bh.cbc('img', '');
        bh.match('img', function(ctx, json) {
            ctx.tag('img');
        });
        bh.apply({
            block: 'img',
        }).should.equal('<img/>');
    });

    it('should skip classes', function() {
        bh.cbc('from', 'to');
        bh.match('link', function(ctx, json) {
            ctx.tag('a');
        });
        bh.apply({
            block: 'link',
        }).should.equal('<a class="link"></a>');
    });
});
