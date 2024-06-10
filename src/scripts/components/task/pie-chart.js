import * as taskStore from '../../database/stores/task.js';

class TaskPieChart extends HTMLElement{
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.innerHTML = `<canvas id="pieChart"></canvas>
        <link rel="stylesheet" href="styles/index.css">
     
        <div id="percentage" class="percentage-container"></div>
        `;
        this.chart = null;
    }

    connectedCallback() {
        this.makeChart();
        taskStore.tasks.listen(() => this.updateChart());
        taskStore.tasks.listen(() => this.updatePercentage());
    }


    statsGetter() {
        const tasks = taskStore.tasks.get();
        const total = tasks.length;
        const completedTasks = [];
        for (let i = 0; i < total; i++) {
            if (tasks[i].status === 'COMPLETED') {
                completedTasks.push(tasks[i]);
            }
        }
        let completed = completedTasks.length;
        return { completed , total };
    }

    makeChart() {
        console.log('Creating chart...');
        const chartContext = this.shadowRoot.getElementById('pieChart').getContext('2d');
        const { completed, total } = this.statsGetter();

        /* global Chart */
        this.chart = new Chart(chartContext, {
            type: 'pie',
            data: {
                labels: ['Completed', 'Incomplete'],
                datasets: [{
                    data: [completed, total - completed],
                    backgroundColor: ['#FF914D', '#594F4F']
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: `Today's Pawgress`,
                        font: {
                            size: 24
                        }
                    }
                }
            }
        });

    }

    updatePercentage() {
        const { completed, total } = this.statsGetter();
        const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);
        const percentageContainer = this.shadowRoot.getElementById('percentage');
        percentageContainer.textContent = `Completed: ${percentage}%`;

    }
    updateChart() {
        const { completed, total } = this.statsGetter();
        this.chart.data.datasets[0].data = [completed, total - completed];
        this.chart.update();
        
    }
    

}
customElements.define('task-pie-component', TaskPieChart);