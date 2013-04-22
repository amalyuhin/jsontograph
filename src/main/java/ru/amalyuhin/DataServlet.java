package ru.amalyuhin;

import com.hp.hpl.jena.query.*;
import com.hp.hpl.jena.rdf.model.Model;
import com.hp.hpl.jena.rdf.model.RDFNode;
import org.apache.commons.fileupload.FileItem;
import org.apache.commons.fileupload.FileUploadException;
import org.apache.commons.fileupload.disk.DiskFileItemFactory;
import org.apache.commons.fileupload.servlet.ServletFileUpload;
import org.json.simple.JSONArray;
import org.json.simple.JSONObject;
import ru.amalyuhin.managers.OntologyManager;
import ru.amalyuhin.managers.TdbManager;
import ru.amalyuhin.utils.JSONExtendedArray;
import ru.amalyuhin.utils.JSONExtendedObject;

import javax.servlet.ServletException;
import javax.servlet.ServletOutputStream;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.util.*;

/**
 * Created with IntelliJ IDEA.
 * User: amalyuhin
 * Date: 20.04.13
 * Time: 18:03
 * To change this template use File | Settings | File Templates.
 */
public class DataServlet extends HttpServlet {
    private final String DATA_DIR = "/data";

    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        final String BASE_DIR = getServletContext().getRealPath("/");
        final String TDB_DIR = BASE_DIR + "tdb";

        String fileName = req.getParameter("file");
        String file = DATA_DIR + "/" + fileName;

        resp.setHeader("Content-Type", "application/json");
        ServletOutputStream output = resp.getOutputStream();

        TdbManager tdbManager = new TdbManager(TDB_DIR);
        Model model = tdbManager.getNamedModel(file);

        if (null != model) {
            String result;

            if (req.getParameterMap().containsKey("query")) {
                result = parseModelByQuery(model, req.getParameter("query"));
            } else {
                result = parseModel(model);
            }

            output.print(result);

        } else {
            output.print(errorJsonResponse(String.format("Named model %s does not exist in TDB store.", file)));
        }


    }

    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        final String BASE_DIR = getServletContext().getRealPath("/");
        final String FILE_FIELD_NAME = "onto_file";

        try {
            List<FileItem> items = new ServletFileUpload(new DiskFileItemFactory()).parseRequest(req);

            for (FileItem item : items) {
                if (!item.isFormField()) {
                    String fieldName = item.getFieldName();

                    if (fieldName.equals(FILE_FIELD_NAME)) {
                        File uploadedFile = processUploadedFile(item);

                        String tdbDir = BASE_DIR + "tdb";
                        String file = DATA_DIR + "/" + uploadedFile.getName();

                        TdbManager tdbManager = new TdbManager(tdbDir);
                        tdbManager.addNamedModel(file);
                        tdbManager.close();
                    }
                }
            }

            resp.sendRedirect("/jsOntoGraph/index");

        } catch (Exception e) {
            throw new ServletException("Cannot parse multipart request.", e);
        }
    }

    private File processUploadedFile(FileItem item) throws Exception{
        String dir = getServletContext().getRealPath("/WEB-INF/classes/data");

        File uploadedFile = new File(dir + "/" + item.getName());

        if (uploadedFile.exists()) {
            do {
                Random random = new Random();
                String path = dir + "/" + random.nextInt();

                uploadedFile = new File(path);

            } while (uploadedFile.exists());
        }

        if (uploadedFile.createNewFile()) {
            item.write(uploadedFile);
        } else {
            throw new FileUploadException("Cannot create file.");
        }

        return uploadedFile;
    }

    private String parseModel(Model model) {
        List<String> nodes = OntologyManager.getNodes(model);
        List<Map<String, String>> links = OntologyManager.getLinks(model, nodes);

        JSONExtendedObject json = new JSONExtendedObject();
        JSONArray jsonNodes = JSONExtendedArray.fromNodes(nodes);

        json.put("status", "success");
        json.put("nodes", jsonNodes);
        json.put("links", links);

        return json.toJSONString();
    }

    private String parseModelByQuery(Model model, String queryString) {
        Query query = QueryFactory.create(queryString);
        QueryExecution qe = QueryExecutionFactory.create(query, model);

        List<String> nodes = new ArrayList<String>();
        List<Map<String, String>> links = new ArrayList<Map<String, String>>();

        try {
            ResultSet results = qe.execSelect() ;

            while (results.hasNext()) {
                QuerySolution solution = results.nextSolution();

                RDFNode s = solution.get("s");
                RDFNode o = solution.get("o");
                RDFNode p = solution.get("p");

                /*if (o.isResource()) {
                    for (StmtIterator iter = o.asResource().listProperties(); iter.hasNext(); ) {
                        System.out.println(o.toString());
                        System.out.println(iter.next().toString());
                        System.out.println("===========================================================");
                    }
                }*/

                String sTitle = getLabel(s);
                String oTitle = getLabel(o);
                String pTitle = getLabel(p);

                if (!nodes.contains((sTitle))) {
                    nodes.add(sTitle);
                }

                if (!nodes.contains((oTitle))) {
                    nodes.add(oTitle);
                }

                if (!pTitle.equals("")) {
                    Map<String, String> edgeMap = new HashMap<String, String>();

                    edgeMap.put("from", String.valueOf(nodes.indexOf(sTitle)));
                    edgeMap.put("to", String.valueOf(nodes.indexOf(oTitle)));
                    edgeMap.put("type", pTitle);

                    links.add(edgeMap);
                }
            }
        } catch (Exception e) {
            return errorJsonResponse(e.getMessage());
        } finally {
            qe.close();
        }

        JSONExtendedObject json = new JSONExtendedObject();
        JSONArray jsonNodes = JSONExtendedArray.fromNodes(nodes);

        json.put("status", "success");
        json.put("nodes", jsonNodes);
        json.put("links", links);

        return json.toJSONString();
    }

    private String getLabel(RDFNode node)
    {
        String label;

        if (null == node) {
            return "";
        }

        if (node.isResource()) {
            label = (node.asResource().getLocalName() != null) ? node.asResource().getLocalName() : node.asResource().toString();
        } else if (node.isLiteral()) {
            label = (node.asLiteral().getLexicalForm() != null) ? node.asLiteral().getLexicalForm() : node.asLiteral().toString();
        } else {
            label = node.toString();
        }

        return label;
    }

    private String errorJsonResponse(String message) {
        JSONObject json = new JSONObject();

        json.put("status", "error");
        json.put("message", message);

        return json.toJSONString();
    }
}
