package ru.amalyuhin.managers;

import com.hp.hpl.jena.query.*;
import com.hp.hpl.jena.rdf.model.Model;
import com.hp.hpl.jena.tdb.TDBFactory;

import java.io.InputStream;

/**
 * Created with IntelliJ IDEA.
 * User: amalyuhin
 * Date: 15.04.13
 * Time: 23:11
 * To change this template use File | Settings | File Templates.
 */
public class TdbManager {

    private Dataset dataset;

    public TdbManager(String tdbDir) {
        dataset = TDBFactory.createDataset(tdbDir);
    }

    public void addNamedModel(String source) {
        dataset.begin(ReadWrite.WRITE);

        try {
            Model nm = dataset.getNamedModel(source);

            InputStream im = TdbManager.class.getResourceAsStream(source);
            if (null == im) {
                throw new Exception("File " + source + " not found.");
            }

            nm.read(im, "");
            nm.close();

        } catch (Exception e) {
            e.printStackTrace();

        } finally {
            dataset.commit();
            dataset.end();
            dataset.close();
        }
    }

    public void removeNamedModel(String name) {
        dataset.begin(ReadWrite.WRITE);
        dataset.removeNamedModel(name);
        dataset.end();
        dataset.close();
    }

    public Model getNamedModel(String name) {
        dataset.begin(ReadWrite.READ);
        Model model = dataset.getNamedModel(name);
        dataset.end();
        dataset.close();

        return model;
    }

    public static ResultSet executeQuery(String queryString, Model model) {
        Query query = QueryFactory.create(queryString);
        QueryExecution qExec = QueryExecutionFactory.create(query, model);

        return qExec.execSelect();
    }

    public void close() {
        dataset.close();
    }
}
