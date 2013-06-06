package ru.amalyuhin.managers;

import com.hp.hpl.jena.rdf.model.*;
import org.json.simple.JSONArray;
import ru.amalyuhin.utils.JSONExtendedArray;
import ru.amalyuhin.utils.JSONExtendedObject;

import java.io.InputStream;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Created with IntelliJ IDEA.
 * User: amalyuhin
 * Date: 10.04.13
 * Time: 1:02
 * To change this template use File | Settings | File Templates.
 */
public class OntologyManager {

    /**
     * Load ontology from file
     *
     * @param file InputStream for ontology file
     * @return
     */
    public static Model loadOntology(InputStream file) {
        Model model = ModelFactory.createDefaultModel();
        model.read(file, "RDF/XML");

        return model;
    }

    /**
     * Get list of nodes
     *
     * @param model
     * @return
     */
    public static List<String> getNodes(Model model) {
        List<String> nodes = new ArrayList<String>();

        for (ResIterator i = model.listSubjects(); i.hasNext(); ) {
            Resource r = i.next();
            nodes.add(getLabel(r));
        }

        return nodes;
    }

    /**
     * Get list of links
     *
     * @param model
     * @return
     */
    public static List<Map<String, String>> getLinks(Model model, List<String> nodes) {
        List<Map<String, String>> links = new ArrayList<Map<String, String>>();

        for (StmtIterator i = model.listStatements(); i.hasNext(); ) {
            Statement stmt = i.nextStatement();
            Map<String, String> map = new HashMap<String, String>();

            Integer fromIndex = nodes.indexOf(getLabel(stmt.getSubject()));
            Integer toIndex = nodes.indexOf(getLabel(stmt.getObject()));

            System.out.println(stmt.getPredicate().toString());

            if (fromIndex != -1 && toIndex != -1) {
                map.put("from", String.valueOf(fromIndex));
                map.put("to", String.valueOf(toIndex));
                map.put("type", getLabel(stmt.getPredicate()));

                links.add(map);
            }
        }

        return links;
    }

    public static JSONExtendedObject getDataAsJson(Model model) {
        List<String> nodes = new ArrayList<String>();
        List<Map<String, String>> links = new ArrayList<Map<String, String>>();

        for (StmtIterator i = model.listStatements(null, null, (RDFNode) null); i.hasNext(); ) {
            Statement stmt = i.nextStatement();

            String subject = getLabel(stmt.getSubject());
            if (!nodes.contains(subject)) {
                nodes.add(subject);
            }

            String object = getLabel(stmt.getObject());
            if (!nodes.contains(object)) {
                nodes.add(object);
            }

            int fromIndex = nodes.indexOf(subject);
            int toIndex = nodes.indexOf(object);

            if (fromIndex != -1 && toIndex != -1) {
                Map<String, String> map = new HashMap<String, String>();

                map.put("from", String.valueOf(fromIndex));
                map.put("to", String.valueOf(toIndex));
                map.put("type", getLabel(stmt.getPredicate()));

                links.add(map);
            }
        }

        JSONExtendedObject json = new JSONExtendedObject();
        JSONArray jsonNodes = JSONExtendedArray.fromNodes(nodes);

        json.put("nodes", jsonNodes);
        json.put("links", links);

        return json;
    }

    /**
     * Get label for subject
     *
     * @param obj
     * @return
     */
    public static String getLabel(Resource obj) {
        return (null != obj.getLocalName()) ? obj.getLocalName() : obj.toString();
    }

    /**
     * Get label for object
     *
     * @param obj
     * @return
     */
    public static String getLabel(RDFNode obj) {
        String label;

        if (obj instanceof Resource) {
            label = getLabel((Resource) obj);
        } else {
            label = obj.toString();
        }

        return label;
    }

    /**
     * Get label for property
     *
     * @param obj
     * @return
     */
    public static String getLabel(Property obj) {
        return (null != obj.getLocalName()) ? obj.getLocalName() : obj.toString();
    }
}
