const express = require('express');
const runTask = require('./runTask');
const loadConfig = require('./loadConfig');
const internalMetricCounter = require('./internalMetricCounter');
const renderPrometheusMetric = require('./renderPrometheusMetric');

module.exports = (config) => {
  const app = express();

  app.get('/', (req, res) => {
    res.send(`
    <a href="/metrics">/metrics</a> (internal)<br/>
    <a href="/all/metrics">/all/metrics</a><br/>
    `);
  });

  app.get('/metrics', (req, res) => {
    res.set({ 'Content-Type': 'text/plain' });
    const measures = internalMetricCounter.getLabels().map(labels => {
      return Object.assign({ value: internalMetricCounter.get(labels) }, labels);
    });
    res.send(renderPrometheusMetric({
      name: 'http_json_query_exporter_query_count',
      description: 'Number of errors in http json query exporter',
      type: 'counter'
    }, measures));
  });

  app.get('/:taskName/metrics', (req, res) => {
    loadConfig(config.configPath).then(config => {
      Promise.all(config.tasks
        .filter(task => req.params.taskName === 'all' || req.params.taskName === task.name)
        .map(task => { 
          !!req.query.url && (task.query.url = req.query.url); 
          !!req.query.proxy && (task.query.proxy = JSON.parse(req.query.proxy)); 
          return task; 
        })
        .map(runTask)).then(lines => {
          internalMetricCounter.increment({ metric: 'all', state: 'success' });
          res.set({ 'Content-Type': 'text/plain' });
          res.send(lines.join('\n'));
        })
        .catch(e => {
          console.error(e);
          internalMetricCounter.increment({ metric: 'all', state: 'error' });
          res.status(500).send(e.stack);
        });
    })
      .catch(e => {
        console.error(e);
        internalMetricCounter.increment({ metric: 'all', state: 'error' });
        res.status(500).send(e.stack);
      });
  });

  return app;
};
