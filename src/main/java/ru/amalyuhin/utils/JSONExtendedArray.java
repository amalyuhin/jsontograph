package ru.amalyuhin.utils;

import org.json.simple.JSONArray;
import org.json.simple.JSONObject;

import java.util.List;

/**
 * Created with IntelliJ IDEA.
 * User: amalyuhin
 * Date: 22.04.13
 * Time: 22:46
 * To change this template use File | Settings | File Templates.
 */
public class JSONExtendedArray extends JSONArray {

    public static JSONArray fromNodes(List<String> nodes) {
        JSONArray jsonArray = new JSONArray();

        for (int i=0; i<nodes.size(); i++) {
            JSONObject jsonObject = new JSONObject();

            jsonObject.put("id", String.valueOf(i));
            jsonObject.put("label", nodes.get(i));

            jsonArray.add(jsonObject);
        }

        return jsonArray;
    }
}
