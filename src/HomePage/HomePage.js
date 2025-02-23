import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Chart from 'chart.js/auto';
import * as d3 from 'd3';

function HomePage() {
  const [budgetData, setBudgetData] = useState([]);
  const chartInstanceRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    axios.get('http://localhost:3000/budget')
      .then(response => {
        setBudgetData(response.data.myBudget);
      })
      .catch(error => console.error('Error fetching budget array:', error));
  }, []);


  useEffect(() => {
    if (budgetData.length === 0) return;

    const labels = budgetData.map(item => item.title);
    const data = budgetData.map(item => item.budget);
    const backgroundColors = [
      '#ffcd56',
      '#ff6384',
      '#36a2eb',
      '#fd6b19',
      '#175e1a',
      '#5e175a',
      '#e238bb'
    ];

    const chartData = {
      labels: labels,
      datasets: [{
        data: data,
        backgroundColor: backgroundColors.slice(0, data.length),
      }]
    };

    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
    }

    const ctx = canvasRef.current.getContext('2d');
    chartInstanceRef.current = new Chart(ctx, {
      type: 'pie',
      data: chartData,
      options: {
        responsive: true,
      }
    });


    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }
    };
  }, [budgetData]);

  
  useEffect(() => {
    if (budgetData.length === 0) return;

    d3.select("#myChart2").select("svg").remove();

    const width = 500;
    const height = 350;
    const radius = Math.min(width, height) / 2;

    const svg = d3.select("#myChart2")
      .append("svg")
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", `translate(${width / 2}, ${height / 2})`);

    const color = d3.scaleOrdinal()
      .domain(budgetData.map(item => item.title))
      .range(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"]);

    const pieGenerator = d3.pie()
      .value(d => d.budget)
      .sort(null);

    const arcGenerator = d3.arc()
      .innerRadius(radius * 0.4)
      .outerRadius(radius * 0.8);

  const outerArc = d3.arc()
  .innerRadius(radius * 0.9)
  .outerRadius(radius * 0.9);


const slicesGroup = svg.append("g").attr("class", "slices");
const labelsGroup = svg.append("g").attr("class", "labels");
const linesGroup  = svg.append("g").attr("class", "lines");

const pieData = pieGenerator(budgetData);


slicesGroup.selectAll("path")
  .data(pieData)
  .enter()
  .append("path")
  .attr("d", arcGenerator)
  .attr("fill", d => color(d.data.title));


labelsGroup.selectAll("text")
  .data(pieData)
  .enter()
  .append("text")
  .attr("dy", ".35em")
  .text(d => d.data.title)
  .attr("transform", d => {
    const pos = outerArc.centroid(d);
    const midAngle = d.startAngle + (d.endAngle - d.startAngle) / 2;
    pos[0] = radius * (midAngle < Math.PI ? 1 : -1);
    return `translate(${pos})`;
  })
  .style("text-anchor", d => {
    const midAngle = d.startAngle + (d.endAngle - d.startAngle) / 2;
    return midAngle < Math.PI ? "start" : "end";
  });

linesGroup.selectAll("polyline")
  .data(pieData)
  .enter()
  .append("polyline")
  .attr("points", d => {
    const posA = arcGenerator.centroid(d);
    const posB = outerArc.centroid(d);
    const midAngle = d.startAngle + (d.endAngle - d.startAngle) / 2;
    const posC = outerArc.centroid(d);
    posC[0] = radius * 0.95 * (midAngle < Math.PI ? 1 : -1);
    return [posA, posB, posC];
  })
  .style("fill", "none")
  .style("stroke", "black")
  .style("stroke-width", 1);

}, [budgetData]);

  return (
    <main className="center" id="main">
      <div className="page-area">
      <article>
          <h2>Stay on track</h2>
          <p>
            Do you know where you are spending your money? If you really stop to track it down,
            you would get surprised! Proper budget management depends on real data... and this
            app will help you with that!
          </p>
        </article>
        <article>
          <h2>Alerts</h2>
          <p>
            What if your clothing budget ended? You will get an alert. The goal is to never go over the budget.
          </p>
        </article>
        <article>
          <h2>Results</h2>
          <p>
            People who stick to a financial plan, budgeting every expense, get out of debt faster!
            Also, they live happier lives... since they expend without guilt or fear... 
            because they know it is all good and accounted for.
          </p>
        </article>
        <article>
          <h2>Free</h2>
          <p>
            This app is free!!! And you are the only one holding your data!
          </p>
        </article>
        <article className="chartjs">
          <h2>Pie Chart</h2>
          <div class="chart-container">
            <canvas id="myChart" ref={canvasRef} width="400" height="400"></canvas>
         </div> 
        </article>
        <article className="d3js">
          <h2>D3JS Chart</h2>
          <div id="myChart2"></div>
        </article>
      </div>
      
    </main>
  );
}

export default HomePage;

