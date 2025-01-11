var canvas = document.getElementById('particle-canvas');
if (canvas) {
    var sketch = function(p) {
        var bodies = [];
        p.setup = function() {
            p.createCanvas(p.windowWidth, p.windowHeight);
            for (var i = 0; i < 3; i++) {
                bodies.push({
                    pos: p.createVector(p.random(p.width), p.random(p.height)),
                    vel: p.createVector(p.random(-1,1), p.random(-1,1)),
                    mass: p.random(1, 3)
                });
            }
        };
        p.draw = function() {
            p.clear();
            bodies.forEach(function(body, i) {
                bodies.forEach(function(other, j) {
                    if (i !== j) {
                        var force = p5.Vector.sub(other.pos, body.pos);
                        var distance = force.mag();
                        distance = p.constrain(distance, 5, 25);
                        force.normalize();
                        var strength = (body.mass * other.mass) / (distance * distance);
                        force.mult(strength);
                        body.vel.add(force);
                    }
                });
            });
            bodies.forEach(function(body) {
                body.pos.add(body.vel);
                if(body.pos.x > p.width || body.pos.x < 0) body.vel.x *= -1;
                if(body.pos.y > p.height || body.pos.y < 0) body.vel.y *= -1;
                p.fill(255, 100);
                p.noStroke();
                p.ellipse(body.pos.x, body.pos.y, body.mass * 10, body.mass * 10);
            });
        };
        p.windowResized = function() {
            p.resizeCanvas(p.windowWidth, p.windowHeight);
        };
    };
    new p5(sketch, 'particle-canvas');
}
