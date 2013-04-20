<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">

    <title>Graph Draw</title>
    <link rel="stylesheet" type="text/css" href="css/tipsy.css">
    <link rel="stylesheet" type="text/css" href="css/myTip.css">
    <link rel="stylesheet" type="text/css" href="css/style.css">

    <script type="text/javascript" src="https://ajax.googleapis.com/ajax/libs/jquery/1.8.1/jquery.min.js"></script>
    <script type="text/javascript" src="js/tooltip.js"></script>

    <script type="text/javascript" src="js/labelBox.js"></script>
    <script type="text/javascript" src="js/eventListener.js"></script>
    <script type="text/javascript" src="js/graph.js"></script>
    <script type="text/javascript" src="js/layout.js"></script>
    <script type="text/javascript" src="js/FRLayout.js"></script>
    <script type="text/javascript" src="js/WalshawLayout.js"></script>
</head>
<body>
    <div id="wrapper">
        <header></header>

        <section id="main">
            <canvas id="myCanvas" width="1300" height="800" style="border:1px solid #000000;">
                Your browser does not support canvas.
            </canvas>
            <div id="loader" style="display: none;"><img src="img/ajax-loader.gif" alt="loading..."/></div>
            <div id="info"></div>
        </section>

        <aside id="tool_bar">
            <form id="select_file_form" action="process" method="get">
                <div>
                    <% String[] files = (String[]) request.getAttribute("ontFiles"); %>

                    <label for="ontology_file">Файл:</label>
                    <select id="ontology_file" name="file">
                        <% if (files.length > 0) { %>
                            <% for (int i=0; i<files.length; i++) { %>
                                <option value="<%= files[i] %>"><%= files[i] %></option>
                            <% } %>
                        <% } else { %>
                            <option></option>
                        <% } %>
                    </select>
                </div>
                <div>
                    <label for="ontology_query">Запрос:</label><br/>
                    <textarea id="ontology_query" name="query" rows="10" cols="60"></textarea>
                </div>
                <div class="algorythm">
                    <label>
                        <input type="radio" name="selected_algorythm" value="FR" checked="checked" /> Фрюхтермана-Рейнтгольда
                    </label>
                    <label>
                        <input type="radio" name="selected_algorythm" value="Walshaw" /> Walshaw
                    </label>
                </div>
                <input type="submit" value="Выбрать" />
            </form>
            <canvas id="labelBoxes" width="500" height="500"></canvas>
        </aside>
    </div>

    <footer></footer>

    <script type="text/javascript">
         $(document).ready(function() {
            var graph, layout;

           //console.time('Data load');

            /*$.getJSON('./data/test.json', function(json){
                console.timeEnd('Data load');

                console.log(json);

                init(json);
            });*/

            /*$.ajax({
                url: 'http://localhost:8080/graphDraw/process',
                dataType: 'json',
                success: function(data) {
                    console.timeEnd('Data load');

                    $('#myCanvas').html('');
                    init(data.results.bindings);
                }
            });*/


            //init();


            $('#select_file_form').submit(function(event){
                event.preventDefault();

                var form = $(this);

                if (layout) {
                    alert('clear layout');
                    layout.clear();
                    delete layout;
                }

                if (graph) {
                    alert('delete graph');
                    delete graph;

                    graph = new Graph();
                }

                var data = {
                    file: form.find('#ontology_file').val()
                };

                var query = form.find('#ontology_query').val();
                if (query != '') {
                    data.query = query;
                }

                $('#loader').show();
                $.ajax({
                    url: form.attr('action'),
                    method: 'post',
                    data: data,
                    dataType: 'json',
                    success: function(json) {
                        init(graph, json);
                    },
                    complete: function(){
                        $('#loader').hide();
                    }
                });
            });
        });

        function init(data) {
            console.profile();

            console.time('Generate graph');

            graph = new Graph();

            for (var i=0; i<data.vertices.length; i++) {
                var v = new Vertex(data.vertices[i]);
                graph.addVertex(v);
            }

            var lineColors = [];
            for (var j=0; j<data.edges.length; j++) {
                var v = graph.getVertexByLabel(data.edges[j].from);
                var u = graph.getVertexByLabel(data.edges[j].to);

                if (v && u) {
                    var lc = lineColors[data.edges[j].type];
                    if (!lc) {
                        lc = "rgba("+Math.round(Math.random()*255)+", "+Math.round(Math.random()*255)+", "+Math.round(Math.random()*255)+", .6)";
                        lineColors[data.edges[j].type] = lc;
                    }

                    graph.addEdge(v, u, {lineColor: lc});
                }
            }

            var canv = document.getElementById('labelBoxes');
            var box = new labelBox(canv, lineColors);
            box.draw();

            console.timeEnd('Generate graph');

            console.log('Vertices count: ' + graph.getVerticesCount());

            var canvas = document.getElementById('myCanvas');
            var context = canvas.getContext("2d");
            var scale = 1;
            var originx = 0;
            var originy = 0;

            var alg = $('#select_file_form .algorythm input[type=radio]:checked').val();
            layout = new window[alg+'Layout'](canvas, graph);

            canvas.onmousewheel = function(event) {
                var mousex = event.clientX - canvas.offsetLeft;
                var mousey = event.clientY - canvas.offsetTop;
                var wheel = event.wheelDelta/120;

                var zoom = Math.pow(1 + Math.abs(wheel)/2 , wheel > 0 ? 1 : -1);

                context.translate(
                        originx,
                        originy
                );
                context.scale(zoom,zoom);
                context.translate(
                        -( mousex / scale + originx - mousex / ( scale * zoom ) ),
                        -( mousey / scale + originy - mousey / ( scale * zoom ) )
                );

                originx = ( mousex / scale + originx - mousex / ( scale * zoom ) );
                originy = ( mousey / scale + originy - mousey / ( scale * zoom ) );
                scale *= zoom;

                layout.zoom(originx, originy, scale);
                layout.redraw();
            };


            function getPosition(event, element) {
                var x;
                var y;

                if (event.pageX || event.pageY) {
                  x = event.pageX;
                  y = event.pageY;
                } else {
                  x = event.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
                  y = event.clientY + document.body.scrollTop + document.documentElement.scrollTop;
                }

                return { x: x-element.offsetLeft, y: y-element.offsetTop }
            }

            canvas.onmousedown = function(event) {
                var mousePos = getPosition(event, canvas);
                var verticesNb = graph.getVerticesCount();
                var selected = false;

                for (var i=0; i<verticesNb; i++) {
                    var v = graph.vertices[i];

                    if ( ((mousePos.x/layout.scale+layout.originx) > (v.pos.x-10) && (mousePos.x/layout.scale+layout.originx) < (v.pos.x+10)) &&
                         ((mousePos.y/layout.scale+layout.originy) > (v.pos.y-10) && (mousePos.y/layout.scale+layout.originy) < (v.pos.y+10))
                    ) {

                        if (!v.isSelected) {
                            onChangePosition(v);

                            selected = true;
                            graph.selectVertex(v);
                            v.addEventlistener('changePosition', onChangePosition);
                        } else {
                            selected = false;
                            graph.unselectVertex(v);
                            v.removeEventlistener('changePosition', onChangePosition);
                        }

                        //v.select();
                        layout.redraw();
                    } else {
                        //v.isSelected = false;
                        graph.unselectVertex(v);
                        v.removeEventlistener('changePosition', onChangePosition);
                    }
                }

                if (!selected) {
                    myTip().hide();
                    v.removeEventlistener('changePosition', onChangePosition);
                }
            };

            layout.run();

            console.profileEnd();
        }

        function onChangePosition(vertex) {
            var transPos = {
                x: (vertex.pos.x-layout.originx)*layout.scale - (vertex.radius*layout.scale - vertex.radius) + vertex.radius*layout.scale,
                y: (vertex.pos.y-layout.originy)*layout.scale - (vertex.radius*layout.scale - vertex.radius)
            };
            myTip({title: vertex.label, x: transPos.x, y: transPos.y, opacity: 1}).show();
        }
    </script>
</body>
</html>