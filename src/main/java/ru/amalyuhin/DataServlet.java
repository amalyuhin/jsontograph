package ru.amalyuhin;

import com.hp.hpl.jena.rdf.model.Model;
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
import java.util.List;
import java.util.Map;
import java.util.Random;

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

            result = parseModel(model);
            /*if (req.getParameterMap().containsKey("query")) {
                result = parseModelByQuery(model, req.getParameter("query"));
            } else {
                result = parseModel(model);
            }*/

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

    private String errorJsonResponse(String message) {
        JSONObject json = new JSONObject();

        json.put("status", "error");
        json.put("message", message);

        return json.toJSONString();
    }
}
