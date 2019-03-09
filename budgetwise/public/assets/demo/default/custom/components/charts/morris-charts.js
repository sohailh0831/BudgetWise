var MorrisChartsDemo = {
    init: function() {
        
        var graph1 = {
          element: "m_morris_2",
            data: [{
                y: "2006",
                'b': 90,
                'a': 100
            }, {
                y: "2007",
                'a': 75,
                'b': 65
            }, {
                y: "2008",
                a: 50,
                b: 40
            }, {
                y: "2009",
                a: 75,
                b: 65
            }, {
                y: "2010",
                a: 50,
                b: 40
            }, {
                y: "2011",
                a: 75,
                b: 65
            }, {
                y: "2012",
                a: 100,
                b: 90
            }],
            xkey: 'y',
            ykeys: ['a', 'b'],
            labels: ['Series A', 'Series B']
        }
        var graph2;
      fetch('http://167.99.156.25/budgetss/get-user-spend-per-category').then(response => {
        return response.json();
      }).then(data23 => {
        // Work with JSON data here
        console.log(data23);
        new Morris.Area(data23)
      }).catch(err => {
        // Do something for an error here
      });

      
      
      
      
    }
};
jQuery(document).ready(function() {
    MorrisChartsDemo.init()
});